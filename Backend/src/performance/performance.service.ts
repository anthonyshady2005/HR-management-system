// performance.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppraisalTemplate, AppraisalTemplateDocument } from './models/appraisal-template.schema';
import { CreateAppraisalTemplateDto } from './DTOs/CreateAppraisalTemplate.dto';
import { AppraisalCycle, AppraisalCycleDocument } from './models/appraisal-cycle.schema';
import { CreateAppraisalCycleDTO } from './DTOs/CreateAppraisalCycle.dto';
import{PositionDocument,Position} from '../organization-structure/models/position.schema'
import { AppraisalAssignmentDocument, AppraisalAssignment } from './models/appraisal-assignment.schema';
import { CreateAppraisalAssignmentDTO } from './DTOs/CreateAppraisalAssignment.dto';
import { AppraisalRecord, AppraisalRecordDocument } from './models/appraisal-record.schema';
import { CreateAppraisalRecordDTO } from './DTOs/CreateAppraisalRecord.dto';
import { UpdateAppraisalRecordDto } from './DTOs/UpdateAppraisalRecord.dto';
import { AppraisalDispute, AppraisalDisputeDocument } from './models/appraisal-dispute.schema';
import { CreateAppraisalDisputeDTO } from './DTOs/CreateAppraisalDispute.dto';
import { UpdateAppraisalDisputeDto } from './DTOs/UpdateAppraisalDispute.dto';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import { AppraisalAssignmentStatus, AppraisalRecordStatus, AppraisalDisputeStatus, AppraisalCycleStatus } from '../performance/enums/performance.enums';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import { NotificationLog } from '../time-management/models/notification-log.schema';
import { EmployeeSystemRole, EmployeeSystemRoleDocument } from '../employee-profile/models/employee-system-role.schema';
import { EmployeeStatus, SystemRole } from 'src/employee-profile/enums/employee-profile.enums';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectModel(AppraisalTemplate.name) private templateModel: Model<AppraisalTemplateDocument>,
    @InjectModel(AppraisalCycle.name) private cycleModel: Model<AppraisalCycleDocument>,
    @InjectModel(AppraisalAssignment.name) private assignmentModel: Model<AppraisalAssignmentDocument>,
    @InjectModel(AppraisalRecord.name) private recordModel: Model<AppraisalRecordDocument>,
    @InjectModel(AppraisalDispute.name) private disputeModel: Model<AppraisalDisputeDocument>,
    @InjectModel(EmployeeProfile.name) private employeeProfileModel: Model<EmployeeProfileDocument>,
    @InjectModel(EmployeeSystemRole.name) private employeeSystemRoleModel: Model<EmployeeSystemRoleDocument>,
    @InjectModel(NotificationLog.name) private notificationLogModel: Model<any>,
    @InjectModel(Position.name)private readonly positionModel: Model<PositionDocument>,

  ) { }

  // Create a new appraisal template (Req 1)
  async createTemplate(dto: CreateAppraisalTemplateDto): Promise<AppraisalTemplate> {
    const template = new this.templateModel(dto);
    try {
      return await template.save();
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      }
      if (error.code === 11000) {
        throw new BadRequestException('Template with this name already exists');
      }
      console.error('Error saving template:', error);
      throw error;
    }
  }

  // Get all appraisal templates
  async getAllTemplates(): Promise<AppraisalTemplate[]> {
    return this.templateModel.find().exec();
  }

  //Create a new appraisal cycle (Req 2)
  async createCycle(dto: CreateAppraisalCycleDTO): Promise<AppraisalCycle> {
    const cycle = new this.cycleModel(dto);
    try {
      const savedCycle = await cycle.save();

      // Notify HR about creation
      await this.notifyHrAdmins(
        'CYCLE_CREATED',
        `New Appraisal Cycle Created: ${savedCycle.name}`
      );

      return savedCycle;
    } catch (error) {
      console.error('Error saving cycle:', error);
      throw error;
    }
  }
  //get all cycles
  async getAllCycles(): Promise<AppraisalCycle[]> {
  return this.cycleModel.find().sort({ startDate: -1 }).exec(); // Optional: sort by startDate descending
}

  // Get active cycles
async getActiveCycles(): Promise<AppraisalCycle[]> {
  const now = new Date();
  return this.cycleModel.find({
  startDate: { $lte: now },
  endDate: { $gte: now }
}).exec();

}

  // Update cycle status
  async updateCycleStatus(cycleId: string, status: string): Promise<AppraisalCycle> {
    const cycle = await this.cycleModel.findById(cycleId);
    if (!cycle) {
      throw new NotFoundException('Appraisal cycle not found');
    }

    const updateData: any = { status };

    if (status === AppraisalCycleStatus.CLOSED) {
      updateData.closedAt = new Date();
    } else if (status === AppraisalCycleStatus.ARCHIVED) {
      updateData.archivedAt = new Date();
      // Also archive all related records
      await this.recordModel.updateMany(
        { cycleId: cycle._id },
        { status: AppraisalRecordStatus.ARCHIVED }
      );
    }

    const updatedCycle = await this.cycleModel.findByIdAndUpdate(
      cycleId,
      updateData,
      { new: true }
    );

    // Notify HR about status change
    await this.notifyHrAdmins(
      'CYCLE_STATUS_UPDATED',
      `Appraisal Cycle ${cycle.name} status updated to ${status}`
    );

    return updatedCycle!;
  }

  /**
   * Cron Job to trigger alerts for appraisal cycle dates (Req 2)
   * Runs every day at midnight.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkCycleAlerts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    // 1. Cycles Starting Today
    const startingCycles = await this.cycleModel.find({
      startDate: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });

    // 2. Cycles Ending Soon (in 3 days)
    const endingCycles = await this.cycleModel.find({
      endDate: { $gte: threeDaysFromNow, $lt: new Date(threeDaysFromNow.getTime() + 24 * 60 * 60 * 1000) }
    });

    if (startingCycles.length === 0 && endingCycles.length === 0) return;

    // Notify for starting cycles
    for (const cycle of startingCycles) {
      await this.notifyHrAdmins(
        'CYCLE_STARTED',
        `Appraisal Cycle Started Today: ${cycle.name}`
      );
    }

    // Notify for ending cycles
    for (const cycle of endingCycles) {
      await this.notifyHrAdmins(
        'CYCLE_ENDING_SOON',
        `Appraisal Cycle Ending in 3 Days: ${cycle.name}`
      );
    }
  }

  /**
   * Helper to notify HR Managers and Admins
   */
  private async notifyHrAdmins(type: string, message: string) {
    if (!this.notificationLogModel) return;

    // 1. Find roles that satisfy HR Manager or System Admin
    // Assuming 'HR Manager' and 'System Admin' are the string values in the enum/roles array
    const hrRoleDocs = await this.employeeSystemRoleModel.find({
      roles: { $in: ['HR Manager', 'System Admin'] }
    });

    if (!hrRoleDocs.length) return;

    // Filter out any docs that might be missing the employeeProfileId
    const hrProfileIds = hrRoleDocs
      .map(doc => doc.employeeProfileId)
      .filter(id => !!id);

    if (hrProfileIds.length === 0) return;

    // 2. Create notifications for each HR user
    const notifications = hrProfileIds.map(id => ({
      to: id,
      type: type,
      message: message,
      createdAt: new Date()
    }));

    await this.notificationLogModel.insertMany(notifications);
  }

  /**
   * Cron Job to automatically manage cycle lifecycle (close and archive cycles)
   * Runs every day at 2 AM
   */
  @Cron('0 2 * * *')
  async manageCycleLifecycle() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // 1. Close cycles that have ended
    const endedCycles = await this.cycleModel.find({
      endDate: { $lt: now },
      status: { $in: ['PLANNED', 'ACTIVE'] }
    });

    for (const cycle of endedCycles) {
      await this.cycleModel.findByIdAndUpdate(cycle._id, {
        status: AppraisalCycleStatus.CLOSED,
        closedAt: new Date()
      });

      // Notify HR about cycle closure
      await this.notifyHrAdmins(
        'CYCLE_CLOSED',
        `Appraisal Cycle Closed: ${cycle.name}`
      );
    }

    // 2. Archive cycles that have been closed for more than 30 days
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const cyclesToArchive = await this.cycleModel.find({
      status: AppraisalCycleStatus.CLOSED,
      closedAt: { $lt: thirtyDaysAgo }
    });

    for (const cycle of cyclesToArchive) {
      await this.cycleModel.findByIdAndUpdate(cycle._id, {
        status: AppraisalCycleStatus.ARCHIVED,
        archivedAt: new Date()
      });

      // Archive all related records
      await this.recordModel.updateMany(
        { cycleId: cycle._id },
        { status: AppraisalRecordStatus.ARCHIVED }
      );

      // Notify HR about cycle archiving
      await this.notifyHrAdmins(
        'CYCLE_ARCHIVED',
        `Appraisal Cycle Archived: ${cycle.name}`
      );
    }

    // 3. Auto-publish completed cycles (optional - can be enabled/disabled)
    // This would automatically publish all submitted appraisals when cycle ends
    // Uncomment if desired:
    /*
    for (const cycle of endedCycles) {
      const assignments = await this.assignmentModel.find({
        cycleId: cycle._id,
        status: AppraisalAssignmentStatus.SUBMITTED
      });

      for (const assignment of assignments) {
        const record = await this.recordModel.findOne({
          assignmentId: assignment._id,
          status: AppraisalRecordStatus.MANAGER_SUBMITTED
        });

        if (record) {
          await this.publishAppraisal(record._id.toString(), 'SYSTEM');
        }
      }
    }
    */
  }

  //Assign appraisal template/cycle to employees and managers in bulk (Req 3)
 async assignAppraisalsBulk(dtos: CreateAppraisalAssignmentDTO[]): Promise<AppraisalAssignment[]> {
    const savedAssignments: AppraisalAssignment[] = [];

    for (const dto of dtos) {
      // Fetch employee
      const employee = await this.employeeProfileModel.findById(dto.employeeProfileId);
      if (!employee) {
        console.log(`Skipping assignment for employee ${dto.employeeProfileId}: Employee not found`);
        continue; // skip missing
      }
      if (employee.status !== 'ACTIVE') {
        console.log(`Skipping assignment for employee ${dto.employeeProfileId}: Employee is not active`);
        continue; // skip inactive
      }
      if (!dto.departmentId) {
        console.log(`Skipping assignment for employee ${dto.employeeProfileId}: No department specified in DTO`);
        continue; // skip if department missing
      }

      // Prevent duplicate assignment
      const existing = await this.assignmentModel.findOne({
        cycleId: dto.cycleId,
        employeeProfileId: employee._id,
      });
      if (existing) {
        console.log(`Skipping assignment for employee ${dto.employeeProfileId}: Duplicate assignment already exists`);
        continue;
      }

      // Resolve department head as manager
      const managerProfileId = await this.getDepartmentHead(dto.departmentId);
      if (!managerProfileId) {
        console.log(`Skipping assignment for employee ${dto.employeeProfileId}: No department head (manager) found for department ${dto.departmentId}`);
        continue; // skip if no manager
      }

      try {
        // Create assignment
        const assignment = new this.assignmentModel({
          ...dto,
          cycleId: new Types.ObjectId(dto.cycleId),
          templateId: new Types.ObjectId(dto.templateId),
          employeeProfileId: new Types.ObjectId(dto.employeeProfileId),
          managerProfileId: new Types.ObjectId(managerProfileId), // Use resolved manager
          departmentId: new Types.ObjectId(dto.departmentId),
          positionId: dto.positionId ? new Types.ObjectId(dto.positionId) : (employee.primaryPositionId ? new Types.ObjectId(employee.primaryPositionId) : undefined),
          status: 'NOT_STARTED',
          assignedAt: new Date(),
        });

        const saved = await assignment.save();
        savedAssignments.push(saved);

        // Create notifications
        const notifications = [
          {
            to: employee._id,
            type: 'APPRAISAL_ASSIGNED',
            message: 'You have been assigned a new appraisal.',
          },
          {
            to: managerProfileId,
            type: 'APPRAISAL_REVIEW_ASSIGNED',
            message: 'You have been assigned to review an employee appraisal.',
          },
        ];

        await this.notificationLogModel.insertMany(notifications);
      } catch (error) {
        console.error(`Error saving assignment for employee ${dto.employeeProfileId}:`, error);
        continue;
      }
    }

    return savedAssignments;
  }

private async getDepartmentHead(departmentId: Types.ObjectId | string): Promise<Types.ObjectId | null> {
  const deptId = typeof departmentId === 'string' ? new Types.ObjectId(departmentId) : departmentId;

  const systemRoleDoc = await this.employeeSystemRoleModel.findOne({
    roles: SystemRole.DEPARTMENT_HEAD,
  }).populate('employeeProfileId');

  // Type assertion: tell TypeScript that this is an EmployeeProfile
  const employeeProfile = systemRoleDoc?.employeeProfileId as EmployeeProfileDocument | undefined;

  if (employeeProfile && employeeProfile.primaryDepartmentId?.toString() === deptId.toString()) {
    return employeeProfile._id;
  }

  return null;
}


  // Get all appraisal assignments for a specific manager (Req 4)
  async getAssignmentsForManager(managerId: string): Promise<AppraisalAssignment[]> {
  return this.assignmentModel
    .find({ managerProfileId: managerId })
    .populate('employeeProfileId', 'firstName lastName position')
    .populate('cycleId', 'name managerDueDate')
    .exec();
}


  // Get all appraisal assignments
  async getAllAssignments(): Promise<AppraisalAssignment[]> {
    return this.assignmentModel.find().exec();
  }

  // REQ-AE-03: Create appraisal record (Req 5)
  async createAppraisalRecord(dto: CreateAppraisalRecordDTO): Promise<AppraisalRecord> {
    const record = new this.recordModel(dto);
    try {
      const assignment = await this.assignmentModel.findById(dto.assignmentId);

      if (!assignment) {
        throw new NotFoundException('Assignment not found');
      }

      if (assignment.managerProfileId.toString() !== dto.managerProfileId.toString()) {
        throw new ForbiddenException('You are not assigned to this appraisal');
      }

      const savedRecord = await record.save();
      
      // Update Assignment status based on Record status
      if (dto.status === AppraisalRecordStatus.MANAGER_SUBMITTED) {
        await this.assignmentModel.findByIdAndUpdate(dto.assignmentId, {
          status: AppraisalAssignmentStatus.SUBMITTED
        }).exec();
      } else if (dto.status === AppraisalRecordStatus.DRAFT) {
        await this.assignmentModel.findByIdAndUpdate(dto.assignmentId, {
          status: AppraisalAssignmentStatus.IN_PROGRESS
        }).exec();
      }

      return savedRecord;
    } catch (error) {
      console.error('Error saving record:', error);
      throw error;
    }
  }
  async getRecords(): Promise<AppraisalRecord[]> {
    return this.recordModel.find().sort({ createdAt: -1 }).exec();
  }
  // REQ-AE-03: Update appraisal record (Req 6)
  async updateAppraisalRecord(recordId: string, dto: UpdateAppraisalRecordDto): Promise<AppraisalRecord> {
    const record = await this.recordModel.findByIdAndUpdate(recordId, dto, { new: true }).exec();
    if (!record) {
      throw new Error('Appraisal record not found');
    }

    // BR 6: Automatically update employee profile when appraisal is published
    if (dto.status === AppraisalRecordStatus.HR_PUBLISHED) {
      const template = await this.templateModel.findById(record.templateId).exec();
      await this.employeeProfileModel.findByIdAndUpdate(
        record.employeeProfileId,
        {
          lastAppraisalRecordId: record._id,
          lastAppraisalCycleId: record.cycleId,
          lastAppraisalTemplateId: record.templateId,
          lastAppraisalDate: dto.hrPublishedAt || new Date(),
          lastAppraisalScore: record.totalScore,
          lastAppraisalRatingLabel: record.overallRatingLabel,
          lastAppraisalScaleType: template?.ratingScale?.type,
          lastDevelopmentPlanSummary: record.improvementAreas,
        },
      ).exec();
    }

    return record;
  }

  // Dashboard data aggregation (Req 7)
async getDashboard(cycleId: string) {
  return this.assignmentModel.aggregate([
    { $match: { cycleId: new Types.ObjectId(cycleId) } },

    {
      $group: {
        _id: '$departmentId',
        total: { $sum: 1 },
        notStarted: { $sum: { $cond: [{ $eq: ['$status', 'NOT_STARTED'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] } },
        submitted: { $sum: { $cond: [{ $eq: ['$status', 'SUBMITTED'] }, 1, 0] } },
        acknowledged: { $sum: { $cond: [{ $eq: ['$status', 'ACKNOWLEDGED'] }, 1, 0] } },
      },
    },
    {
      $lookup: {
        from: 'departments',
        localField: '_id',
        foreignField: '_id',
        as: 'department',
      },
    },
    { $unwind: '$department' },

    {
      $project: {
        _id: 0,
        departmentId: '$_id',
        departmentName: '$department.name',
        total: 1,
        notStarted: 1,
        inProgress: 1,
        submitted: 1,
        acknowledged: 1,
        completionRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$acknowledged', '$total'] }, 100] },
          ],
        },
      },
    },
  ]);
}


  // REQ-AE-06: Monitor appraisal progress and get pending forms (Req 8)
  async getPendingAppraisals(cycleId: string) {
  return this.assignmentModel
    .find({
      cycleId: new Types.ObjectId(cycleId),
      status: { $in: ['NOT_STARTED', 'IN_PROGRESS'] },
    })
    .populate('employeeProfileId', 'fullName email')
    .populate('departmentId', 'name')
    .exec();
}
async sendReminder(assignmentId: Types.ObjectId) {
  const assignment = await this.assignmentModel.findById(assignmentId)
    .populate('employeeProfileId');

  if (!assignment) return;

  await this.notificationLogModel.create({
    to: assignment.employeeProfileId._id,
    type: 'APPRAISAL_REMINDER',
    message: 'Reminder: Please complete your performance appraisal.',
  });
}

  // REQ-OD-01: View final ratings, feedback, and development notes (Req 9)
  async getEmployeeAppraisals(employeeId: string): Promise<AppraisalRecord[]> {
    return this.recordModel
      .find({ employeeProfileId: employeeId })
      .populate('cycleId', 'name cycleType startDate endDate')
      .populate('templateId', 'name')
      .populate('managerProfileId', 'employeeNumber')
      .exec();
  }


  // REQ-AE-07: Flag or raise a concern about a rating (Req 10)
  async createAppraisalDispute(dto: CreateAppraisalDisputeDTO): Promise<AppraisalDispute> {
    // Validate IDs
    const idFields = ['appraisalId', 'assignmentId', 'cycleId', 'raisedByEmployeeId'] as const;
    for (const field of idFields) {
      if (!Types.ObjectId.isValid(dto[field])) {
        throw new BadRequestException(`Invalid ObjectId for ${field}`);
      }
    }

    // Find the appraisal record
    const appraisal = await this.recordModel.findById(dto.appraisalId).exec();
    if (!appraisal || !appraisal.hrPublishedAt) {
      throw new BadRequestException('Appraisal record or publication date not found');
    }

    // Check 7-day window
    const daysSincePublication = Math.floor(
      (new Date().getTime() - new Date(appraisal.hrPublishedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSincePublication > 7) {
      throw new BadRequestException('Dispute must be filed within 7 days of appraisal publication');
    }

    // **Do NOT include _id from DTO**


    const dispute = new this.disputeModel({
      _id: uuidv4(), // manually generate unique id
      appraisalId: new Types.ObjectId(dto.appraisalId),
      assignmentId: new Types.ObjectId(dto.assignmentId),
      cycleId: new Types.ObjectId(dto.cycleId),
      raisedByEmployeeId: new Types.ObjectId(dto.raisedByEmployeeId),
      reason: dto.reason,
      status: dto.status || 'OPEN',
    });

    return await dispute.save();
  }





  // REQ-AE-07: Update dispute status (Req 11)
  async updateAppraisalDispute(disputeId: string, dto: UpdateAppraisalDisputeDto): Promise<AppraisalDispute> {
    const dispute = await this.disputeModel.findByIdAndUpdate(disputeId, dto, { new: true }).exec();
    if (!dispute) {
      throw new Error('Appraisal dispute not found');
    }
    return dispute;
  }

  // REQ-OD-07: Get all disputes for HR Manager to resolve (Req 12)
  async getAllDisputes(): Promise<AppraisalDispute[]> {
    return this.disputeModel
      .find()
      .populate('appraisalId')
      .populate('assignmentId')
      .populate('cycleId', 'name')
      .populate('raisedByEmployeeId', 'employeeNumber')
      .populate('assignedReviewerEmployeeId', 'employeeNumber')
      .exec();
  }

  // Publish appraisal and update employee profile (Step 4)
  async publishAppraisal(recordId: string, publishedByEmployeeId: string): Promise<AppraisalRecord> {

    const record = await this.recordModel.findById(recordId).exec();
    if (!record) {
      throw new Error('Appraisal record not found');
    }

    const updatedRecord = await this.recordModel.findByIdAndUpdate(
      recordId,
      {
        status: AppraisalRecordStatus.HR_PUBLISHED,
        hrPublishedAt: new Date(),
        publishedByEmployeeId: new Types.ObjectId(publishedByEmployeeId),
      },
      { new: true },
    ).exec();

    if (!updatedRecord) {
      throw new Error('Failed to update appraisal record');
    }

    // BR 6: Automatically update employee profile when appraisal is published
    const template = await this.templateModel.findById(record.templateId).exec();
    await this.employeeProfileModel.findByIdAndUpdate(
      record.employeeProfileId,
      {
        lastAppraisalRecordId: updatedRecord._id,
        lastAppraisalCycleId: record.cycleId,
        lastAppraisalTemplateId: record.templateId,
        lastAppraisalDate: new Date(),
        lastAppraisalScore: updatedRecord.totalScore,
        lastAppraisalRatingLabel: updatedRecord.overallRatingLabel,
        lastAppraisalScaleType: template?.ratingScale?.type,
        lastDevelopmentPlanSummary: updatedRecord.improvementAreas,
      },
    ).exec();

    return updatedRecord;
  }

  // REQ-OD-08: Access past appraisal history and multi-cycle trend views (Req 13)
  async getEmployeeAppraisalHistory(employeeId: string): Promise<AppraisalRecord[]> {
    return this.recordModel
      .find({
        employeeProfileId: employeeId,
      })
      .populate('cycleId', '_id name cycleType startDate endDate')
      .populate('templateId', 'name templateType ratingScale')
      .populate('managerProfileId', 'employeeNumber')
      .populate('assignmentId', 'employeeProfileId') // Add assignmentId population
      .sort({ createdAt: -1 })
      .exec();
  }

  // REQ-OD-06: Generate and export outcome reports (Req 14)
  async generateAppraisalReport(cycleId: string) {
    const cycle = await this.cycleModel.findById(cycleId).exec();
    if (!cycle) {
      throw new Error('Appraisal cycle not found');
    }

    const records = await this.recordModel
      .find({ cycleId: cycleId })
      .populate('employeeProfileId', 'employeeNumber')
      .populate('assignmentId')
      .exec();

    const total = records.length;
    const published = records.filter(r => r.status === AppraisalRecordStatus.HR_PUBLISHED).length;
    const recordsWithScores = records.filter(r => r.totalScore !== undefined);
    const averageScore = recordsWithScores.length > 0
      ? recordsWithScores.reduce((sum, r) => sum + (r.totalScore || 0), 0) / recordsWithScores.length
      : 0;

    const scoreDistribution = {
      excellent: records.filter(r => (r.totalScore || 0) >= 90).length,
      good: records.filter(r => (r.totalScore || 0) >= 70 && (r.totalScore || 0) < 90).length,
      satisfactory: records.filter(r => (r.totalScore || 0) >= 50 && (r.totalScore || 0) < 70).length,
      needsImprovement: records.filter(r => (r.totalScore || 0) < 50).length,
    };

    return {
      cycleId: cycle._id,
      cycleName: cycle.name,
      cycleType: cycle.cycleType,
      startDate: cycle.startDate,
      endDate: cycle.endDate,
      totalAppraisals: total,
      publishedAppraisals: published,
      averageScore: Math.round(averageScore * 100) / 100,
      scoreDistribution: scoreDistribution,
      records: records.map(r => ({
        employeeId: r.employeeProfileId,
        score: r.totalScore,
        rating: r.overallRatingLabel,
        status: r.status,
      })),
    };
  }
  // Helper for Individual Fetch
  async getAssignmentById(assignmentId: string): Promise<AppraisalAssignment> {
    const assignment = await this.assignmentModel.findById(assignmentId).exec();
    if (!assignment) throw new BadRequestException('Assignment not found');
    return assignment;
  }

  async getTemplateById(templateId: string): Promise<AppraisalTemplate> {
    const template = await this.templateModel.findById(templateId).exec();
    if (!template) throw new BadRequestException('Template not found');
    return template;
  }
}
