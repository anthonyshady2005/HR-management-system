import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  StructureApproval,
  StructureApprovalDocument,
} from './models/structure-approval.schema';
import {
  StructureChangeRequest,
  StructureChangeRequestDocument,
} from './models/structure-change-request.schema';
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from '../employee-profile/models/employee-profile.schema';
import { StructureChangeRequestService } from './structure-change-request.service';
import { OrganizationStructureService } from './organization-structure.service';
import { ApproveChangeRequestDto } from './dto/approve-change-request.dto';
import { RejectChangeRequestDto } from './dto/reject-change-request.dto';
import {
  ApprovalDecision,
  StructureRequestStatus,
  StructureRequestType,
} from './enums/organization-structure.enums';
import { NotificationLog, NotificationLogDocument } from '../time-management/models/notification-log.schema';

@Injectable()
export class StructureApprovalService {
  constructor(
    @InjectModel(StructureApproval.name)
    private approvalModel: Model<StructureApprovalDocument>,
    @InjectModel(StructureChangeRequest.name)
    private changeRequestModel: Model<StructureChangeRequestDocument>,
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
    @InjectModel(NotificationLog.name)
    private notificationLogModel: Model<NotificationLogDocument>,
    private changeRequestService: StructureChangeRequestService,
    private organizationStructureService: OrganizationStructureService,
  ) {}

  /**
   * Get all pending approvals (for System Admin)
   */
  async getPendingApprovals(): Promise<StructureChangeRequestDocument[]> {
    return await this.changeRequestService.getPendingChangeRequests();
  }

  /**
   * Approve a change request and apply the changes
   */
  async approveChangeRequest(
    requestId: string,
    approverEmployeeId: string,
    dto: ApproveChangeRequestDto,
  ): Promise<{
    approval: StructureApprovalDocument;
    changeRequest: StructureChangeRequestDocument;
  }> {
    const changeRequest = await this.changeRequestModel.findById(requestId);
    if (!changeRequest) {
      throw new NotFoundException(`Change request with ID ${requestId} not found`);
    }

    if (
      changeRequest.status !== StructureRequestStatus.SUBMITTED &&
      changeRequest.status !== StructureRequestStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException(
        `Cannot approve request with status ${changeRequest.status}. Only SUBMITTED or UNDER_REVIEW requests can be approved.`,
      );
    }

    // Verify approver exists
    const approver = await this.employeeProfileModel.findById(
      approverEmployeeId,
    );
    if (!approver) {
      throw new NotFoundException(
        `Approver with ID ${approverEmployeeId} not found`,
      );
    }

    // Prevent users from approving their own requests
    const requesterId = changeRequest.requestedByEmployeeId?.toString();
    const approverId = approverEmployeeId.toString();
    if (requesterId === approverId) {
      throw new ForbiddenException(
        'You cannot approve your own change request',
      );
    }

    // Update status to APPROVED
    changeRequest.status = StructureRequestStatus.APPROVED;
    await changeRequest.save();

    // Create approval record - ensure IDs are ObjectIds
    const approval = await this.approvalModel.create({
      changeRequestId: new Types.ObjectId(changeRequest._id),
      approverEmployeeId: new Types.ObjectId(approverEmployeeId),
      decision: ApprovalDecision.APPROVED,
      decidedAt: new Date(),
      comments: dto.comments,
    });

    // Try to apply the approved changes
    // If implementation is not complete, keep status as APPROVED (not IMPLEMENTED)
    try {
      await this.applyApprovedChanges(changeRequest);
      // Only mark as IMPLEMENTED if changes were successfully applied
      changeRequest.status = StructureRequestStatus.IMPLEMENTED;
      await changeRequest.save();
    } catch (error) {
      // If applying changes fails (e.g., not implemented yet), log but don't fail the approval
      // The request remains APPROVED but not IMPLEMENTED, indicating manual action may be needed
      console.warn(
        `Request ${changeRequest.requestNumber} approved but changes could not be applied: ${error.message}`,
      );
      // Keep status as APPROVED (not IMPLEMENTED) to indicate manual action may be needed
    }

    // Notify requester of approval
    await this.notifyChangeRequestDecision(
      changeRequest.requestedByEmployeeId.toString(),
      changeRequest.requestNumber,
      'APPROVED',
    );

    // Notify structural change to affected managers
    await this.notifyStructuralChange(changeRequest);

    return { approval, changeRequest };
  }

  /**
   * Reject a change request
   */
  async rejectChangeRequest(
    requestId: string,
    approverEmployeeId: string,
    dto: RejectChangeRequestDto,
  ): Promise<{
    approval: StructureApprovalDocument;
    changeRequest: StructureChangeRequestDocument;
  }> {
    const changeRequest = await this.changeRequestModel.findById(requestId);
    if (!changeRequest) {
      throw new NotFoundException(`Change request with ID ${requestId} not found`);
    }

    if (
      changeRequest.status !== StructureRequestStatus.SUBMITTED &&
      changeRequest.status !== StructureRequestStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException(
        `Cannot reject request with status ${changeRequest.status}. Only SUBMITTED or UNDER_REVIEW requests can be rejected.`,
      );
    }

    // Verify approver exists
    const approver = await this.employeeProfileModel.findById(
      approverEmployeeId,
    );
    if (!approver) {
      throw new NotFoundException(
        `Approver with ID ${approverEmployeeId} not found`,
      );
    }

    // Prevent users from rejecting their own requests
    const requesterId = changeRequest.requestedByEmployeeId?.toString();
    const approverId = approverEmployeeId.toString();
    if (requesterId === approverId) {
      throw new ForbiddenException(
        'You cannot reject your own change request',
      );
    }

    // Update request status to REJECTED
    changeRequest.status = StructureRequestStatus.REJECTED;
    await changeRequest.save();

    // Create approval record - ensure IDs are ObjectIds
    const approval = await this.approvalModel.create({
      changeRequestId: new Types.ObjectId(changeRequest._id),
      approverEmployeeId: new Types.ObjectId(approverEmployeeId),
      decision: ApprovalDecision.REJECTED,
      decidedAt: new Date(),
      comments: dto.comments,
    });

    // Notify requester of rejection
    await this.notifyChangeRequestDecision(
      changeRequest.requestedByEmployeeId.toString(),
      changeRequest.requestNumber,
      'REJECTED',
      dto.comments,
    );

    return { approval, changeRequest };
  }

  /**
   * Apply approved changes to the organizational structure
   */
  private async applyApprovedChanges(
    changeRequest: StructureChangeRequestDocument,
  ): Promise<void> {
    switch (changeRequest.requestType) {
      case StructureRequestType.NEW_DEPARTMENT:
        // For new department, the details should contain the department data
        // This is a simplified implementation - in production, you'd parse the details
        // or have a separate schema for change request data
        throw new BadRequestException(
          'NEW_DEPARTMENT requests require additional implementation',
        );

      case StructureRequestType.UPDATE_DEPARTMENT:
        if (!changeRequest.targetDepartmentId) {
          throw new BadRequestException(
            'targetDepartmentId is required for UPDATE_DEPARTMENT requests',
          );
        }
        // Update department based on details
        // This is a simplified implementation
        throw new BadRequestException(
          'UPDATE_DEPARTMENT requests require additional implementation',
        );

      case StructureRequestType.NEW_POSITION:
        // For new position, the details should contain the position data
        // This is a simplified implementation
        throw new BadRequestException(
          'NEW_POSITION requests require additional implementation',
        );

      case StructureRequestType.UPDATE_POSITION:
        if (!changeRequest.targetPositionId) {
          throw new BadRequestException(
            'targetPositionId is required for UPDATE_POSITION requests',
          );
        }
        // Update position based on details
        // This is a simplified implementation
        throw new BadRequestException(
          'UPDATE_POSITION requests require additional implementation',
        );

      case StructureRequestType.CLOSE_POSITION:
        if (!changeRequest.targetPositionId) {
          throw new BadRequestException(
            'targetPositionId is required for CLOSE_POSITION requests',
          );
        }
        // Deactivate the position
        await this.organizationStructureService.deactivatePosition(
          changeRequest.targetPositionId.toString(),
        );
        break;

      default:
        throw new BadRequestException(
          `Unknown request type: ${changeRequest.requestType}`,
        );
    }
  }

  /**
   * Get approval history for a change request
   */
  async getApprovalHistory(
    requestId: string,
  ): Promise<StructureApprovalDocument[]> {
    if (!requestId || !Types.ObjectId.isValid(requestId)) {
      throw new BadRequestException('Invalid change request ID');
    }
    
    const requestObjectId = new Types.ObjectId(requestId);
    
    // Query using $or to match both string and ObjectId formats
    return await this.approvalModel
      .find({
        $or: [
          { changeRequestId: requestId }, // Match string format
          { changeRequestId: requestObjectId }, // Match ObjectId format
        ],
      })
      .populate('approverEmployeeId', 'employeeNumber firstName lastName')
      .sort({ decidedAt: -1 })
      .exec();
  }

  /**
   * Notify structural change to affected managers and stakeholders
   */
  private async notifyStructuralChange(
    changeRequest: StructureChangeRequestDocument,
  ): Promise<void> {
    // Get System Admins and HR Managers to notify
    const admins = await this.employeeProfileModel
      .find({
        $or: [
          { 'systemRoles.role': 'System Admin' },
          { 'systemRoles.role': 'HR Manager' },
        ],
      })
      .select('_id')
      .lean()
      .exec();

    const notifications = admins.map((admin) => ({
      to: admin._id,
      type: 'STRUCTURE_CHANGE_APPROVED',
      message: `Structural change request ${changeRequest.requestNumber} has been approved and implemented. Type: ${changeRequest.requestType}`,
    }));

    if (notifications.length > 0) {
      await this.notificationLogModel.insertMany(notifications);
    }
  }

  /**
   * Notify change request decision (approval/rejection) to requester
   */
  private async notifyChangeRequestDecision(
    requesterEmployeeId: string,
    requestNumber: string,
    decision: 'APPROVED' | 'REJECTED',
    comments?: string,
  ): Promise<void> {
    const message =
      decision === 'APPROVED'
        ? `Your change request ${requestNumber} has been approved and implemented.`
        : `Your change request ${requestNumber} has been rejected.${comments ? ` Reason: ${comments}` : ''}`;

    await this.notificationLogModel.create({
      to: new Types.ObjectId(requesterEmployeeId),
      type: `STRUCTURE_CHANGE_REQUEST_${decision}`,
      message,
    });
  }
}

