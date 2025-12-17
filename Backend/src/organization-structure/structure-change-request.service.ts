import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  StructureChangeRequest,
  StructureChangeRequestDocument,
} from './models/structure-change-request.schema';
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from '../employee-profile/models/employee-profile.schema';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { UpdateChangeRequestDto } from './dto/update-change-request.dto';
import {
  StructureRequestStatus,
  StructureRequestType,
} from './enums/organization-structure.enums';
import { NotificationLog, NotificationLogDocument } from '../time-management/models/notification-log.schema';

@Injectable()
export class StructureChangeRequestService {
  constructor(
    @InjectModel(StructureChangeRequest.name)
    private changeRequestModel: Model<StructureChangeRequestDocument>,
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
    @InjectModel(NotificationLog.name)
    private notificationLogModel: Model<NotificationLogDocument>,
  ) {}

  /**
   * Generate unique request number
   */
  private generateRequestNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `OS-REQ-${timestamp}-${random}`;
  }

  /**
   * Create a new change request (SUBMITTED status - ready for approval)
   */
  async createChangeRequest(
    dto: CreateChangeRequestDto,
    requestedByEmployeeId: string,
  ): Promise<StructureChangeRequestDocument> {
    // Validate employee ID is a valid ObjectId
    if (!Types.ObjectId.isValid(requestedByEmployeeId)) {
      throw new BadRequestException(
        `Invalid employee ID: ${requestedByEmployeeId}`,
      );
    }

    // Validate requester exists
    const requester = await this.employeeProfileModel.findById(
      requestedByEmployeeId,
    );
    if (!requester) {
      throw new NotFoundException(
        `Employee with ID ${requestedByEmployeeId} not found`,
      );
    }

    // Generate unique request number
    let requestNumber: string = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      requestNumber = this.generateRequestNumber();
      const existing = await this.changeRequestModel.findOne({ requestNumber });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique || !requestNumber) {
      throw new BadRequestException(
        'Failed to generate unique request number. Please try again.',
      );
    }

    // Validate request type and target IDs
    if (
      (dto.requestType === StructureRequestType.NEW_DEPARTMENT ||
        dto.requestType === StructureRequestType.UPDATE_DEPARTMENT) &&
      !dto.targetDepartmentId
    ) {
      throw new BadRequestException(
        'targetDepartmentId is required for department-related requests',
      );
    }

    if (
      (dto.requestType === StructureRequestType.NEW_POSITION ||
        dto.requestType === StructureRequestType.UPDATE_POSITION ||
        dto.requestType === StructureRequestType.CLOSE_POSITION) &&
      dto.requestType !== StructureRequestType.NEW_POSITION &&
      !dto.targetPositionId
    ) {
      throw new BadRequestException(
        'targetPositionId is required for position update/close requests',
      );
    }

    // Build the document data - use string IDs instead of ObjectId instances
    // Mongoose will automatically convert them to ObjectIds when saving
    const changeRequestData: any = {
      requestNumber,
      requestedByEmployeeId: requestedByEmployeeId.toString(),
      requestType: dto.requestType,
      status: StructureRequestStatus.DRAFT,
    };

    // Add optional string fields
    if (dto.details) {
      changeRequestData.details = dto.details;
    }
    if (dto.reason) {
      changeRequestData.reason = dto.reason;
    }

    // Only add targetDepartmentId if it exists and is valid
    if (dto.targetDepartmentId) {
      const deptIdStr =
        typeof dto.targetDepartmentId === 'string'
          ? dto.targetDepartmentId
          : dto.targetDepartmentId.toString();
      if (deptIdStr && deptIdStr.trim() !== '' && Types.ObjectId.isValid(deptIdStr)) {
        changeRequestData.targetDepartmentId = deptIdStr;
      }
    }

    // Only add targetPositionId if it exists and is valid
    if (dto.targetPositionId) {
      const posIdStr =
        typeof dto.targetPositionId === 'string'
          ? dto.targetPositionId
          : dto.targetPositionId.toString();
      if (posIdStr && posIdStr.trim() !== '' && Types.ObjectId.isValid(posIdStr)) {
        changeRequestData.targetPositionId = posIdStr;
      }
    }

    try {
      // Ensure IDs are stored as ObjectIds, not strings
      // This ensures consistent querying later
      if (changeRequestData.requestedByEmployeeId) {
        changeRequestData.requestedByEmployeeId = new Types.ObjectId(changeRequestData.requestedByEmployeeId);
      }
      if (changeRequestData.targetDepartmentId) {
        changeRequestData.targetDepartmentId = new Types.ObjectId(changeRequestData.targetDepartmentId);
      }
      if (changeRequestData.targetPositionId) {
        changeRequestData.targetPositionId = new Types.ObjectId(changeRequestData.targetPositionId);
      }
      
      // Use create() which handles ObjectId properly
      return await this.changeRequestModel.create(changeRequestData);
    } catch (error: any) {
      console.error('Error creating change request:', error);
      console.error('Change request data:', JSON.stringify(changeRequestData, null, 2));
      throw new BadRequestException(
        `Failed to create change request: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Submit a change request (change status from DRAFT to SUBMITTED)
   */
  async submitChangeRequest(
    requestId: string,
    submittedByEmployeeId: string,
  ): Promise<StructureChangeRequestDocument> {
    const request = await this.changeRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException(`Change request with ID ${requestId} not found`);
    }

    if (request.status !== StructureRequestStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot submit request with status ${request.status}. Only DRAFT requests can be submitted.`,
      );
    }

    // Verify submitter is the requester
    if (
      request.requestedByEmployeeId.toString() !== submittedByEmployeeId
    ) {
      throw new ForbiddenException(
        'Only the requester can submit their own change request',
      );
    }

    request.status = StructureRequestStatus.SUBMITTED;
    request.submittedByEmployeeId = new Types.ObjectId(submittedByEmployeeId);
    request.submittedAt = new Date();

    await request.save();

    // Notify System Admin of submitted request
    await this.notifyChangeRequestSubmitted(request);

    return request;
  }

  /**
   * Update a DRAFT change request
   */
  async updateDraftRequest(
    requestId: string,
    dto: UpdateChangeRequestDto,
    employeeId: string,
  ): Promise<StructureChangeRequestDocument> {
    const request = await this.changeRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException(`Change request with ID ${requestId} not found`);
    }

    if (request.status !== StructureRequestStatus.DRAFT) {
      throw new BadRequestException(
        'Only DRAFT requests can be updated',
      );
    }

    // Verify updater is the requester
    if (
      request.requestedByEmployeeId.toString() !== employeeId
    ) {
      throw new ForbiddenException(
        'Only the requester can update their own change request',
      );
    }

    if (dto.details !== undefined) {
      request.details = dto.details;
    }
    if (dto.reason !== undefined) {
      request.reason = dto.reason;
    }

    return await request.save();
  }

  /**
   * Cancel a change request (only DRAFT or SUBMITTED)
   */
  async cancelChangeRequest(
    requestId: string,
    employeeId: string,
  ): Promise<StructureChangeRequestDocument> {
    const request = await this.changeRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException(`Change request with ID ${requestId} not found`);
    }

    if (
      request.status === StructureRequestStatus.APPROVED ||
      request.status === StructureRequestStatus.IMPLEMENTED ||
      request.status === StructureRequestStatus.CANCELED
    ) {
      throw new BadRequestException(
        `Cannot cancel request with status ${request.status}`,
      );
    }

    // Verify canceler is the requester
    if (
      request.requestedByEmployeeId.toString() !== employeeId
    ) {
      throw new ForbiddenException(
        'Only the requester can cancel their own change request',
      );
    }

    request.status = StructureRequestStatus.CANCELED;
    return await request.save();
  }

  /**
   * Get change request by ID
   */
  async getChangeRequestById(
    requestId: string,
  ): Promise<StructureChangeRequestDocument> {
    const request = await this.changeRequestModel
      .findById(requestId)
      .populate('requestedByEmployeeId', 'employeeNumber firstName lastName')
      .populate('submittedByEmployeeId', 'employeeNumber firstName lastName')
      .exec();

    if (!request) {
      throw new NotFoundException(`Change request with ID ${requestId} not found`);
    }

    return request;
  }

  /**
   * Get all change requests by requester
   */
  /**
   * Get all change requests (System Admin only)
   */
  async getAllChangeRequests(): Promise<StructureChangeRequestDocument[]> {
    try {
      // Use regular populate with options to handle null/undefined
      const requests = await this.changeRequestModel
        .find()
        .populate({
          path: 'requestedByEmployeeId',
          select: 'firstName lastName employeeNumber',
          options: { lean: false },
        })
        .populate({
          path: 'targetDepartmentId',
          select: 'name code',
          options: { lean: false },
          match: { _id: { $exists: true } }, // Only populate if _id exists
        })
        .populate({
          path: 'targetPositionId',
          select: 'title code',
          options: { lean: false },
          match: { _id: { $exists: true } }, // Only populate if _id exists
        })
        .sort({ createdAt: -1 })
        .exec();

      return requests;
    } catch (error: any) {
      console.error('Error fetching all change requests:', error);
      // If populate fails, return without populate rather than crashing
      const requests = await this.changeRequestModel
        .find()
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      return requests as StructureChangeRequestDocument[];
    }
  }

  async getChangeRequestsByRequester(
    employeeId: string,
  ): Promise<StructureChangeRequestDocument[]> {
    if (!employeeId || !Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee ID');
    }
    
    // Query using $or to match both string and ObjectId formats
    // (Some records may have been stored as strings, some as ObjectIds)
    const employeeObjectId = new Types.ObjectId(employeeId);
    
    const requests = await this.changeRequestModel
      .find({
        $or: [
          { requestedByEmployeeId: employeeId }, // Match string format
          { requestedByEmployeeId: employeeObjectId }, // Match ObjectId format
        ],
      })
      .populate('requestedByEmployeeId', 'employeeNumber firstName lastName')
      .populate('submittedByEmployeeId', 'employeeNumber firstName lastName')
      .populate('targetDepartmentId', 'name code')
      .populate('targetPositionId', 'title code')
      .sort({ createdAt: -1 })
      .exec();
    
    return requests;
  }

  /**
   * Get all pending change requests (for System Admin)
   */
  async getPendingChangeRequests(): Promise<StructureChangeRequestDocument[]> {
    return await this.changeRequestModel
      .find({
        status: {
          $in: [
            StructureRequestStatus.SUBMITTED,
            StructureRequestStatus.UNDER_REVIEW,
          ],
        },
      })
      .populate('requestedByEmployeeId', 'employeeNumber firstName lastName')
      .populate('submittedByEmployeeId', 'employeeNumber firstName lastName')
      .sort({ submittedAt: -1, createdAt: -1 })
      .exec();
  }

  /**
   * Notify System Admin when a change request is submitted
   */
  private async notifyChangeRequestSubmitted(
    changeRequest: StructureChangeRequestDocument,
  ): Promise<void> {
    // Get System Admins
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
      type: 'STRUCTURE_CHANGE_REQUEST_SUBMITTED',
      message: `New change request ${changeRequest.requestNumber} has been submitted for review. Type: ${changeRequest.requestType}`,
    }));

    if (notifications.length > 0) {
      await this.notificationLogModel.insertMany(notifications);
    }
  }
}

