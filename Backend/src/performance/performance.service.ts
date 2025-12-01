// performance.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import { AppraisalTemplate, AppraisalTemplateDocument } from './models/appraisal-template.schema';
import { CreateAppraisalTemplateDto } from './DTOs/CreateAppraisalTemplate.dto';
import { AppraisalCycle, AppraisalCycleDocument } from './models/appraisal-cycle.schema';
import { CreateAppraisalCycleDTO } from './DTOs/CreateAppraisalCycle.dto';
import { AppraisalAssignmentDocument, AppraisalAssignment } from './models/appraisal-assignment.schema';
import { CreateAppraisalAssignmentDTO } from './DTOs/CreateAppraisalAssignment.dto';
import { AppraisalRecord, AppraisalRecordDocument } from './models/appraisal-record.schema';
import { CreateAppraisalRecordDTO } from './DTOs/CreateAppraisalRecord.dto';
import { UpdateAppraisalRecordDto } from './DTOs/UpdateAppraisalRecord.dto';
import { AppraisalDispute, AppraisalDisputeDocument } from './models/appraisal-dispute.schema';
import { CreateAppraisalDisputeDTO } from './DTOs/CreateAppraisalDispute.dto';
import { UpdateAppraisalDisputeDto } from './DTOs/UpdateAppraisalDispute.dto';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import { AppraisalAssignmentStatus, AppraisalRecordStatus ,AppraisalDisputeStatus} from '../performance/enums/performance.enums';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectModel(AppraisalTemplate.name) private templateModel: Model<AppraisalTemplateDocument>,
    @InjectModel(AppraisalCycle.name) private cycleModel: Model<AppraisalCycleDocument>,
    @InjectModel(AppraisalAssignment.name) private assignmentModel: Model<AppraisalAssignmentDocument>,
    @InjectModel(AppraisalRecord.name) private recordModel: Model<AppraisalRecordDocument>,
    @InjectModel(AppraisalDispute.name) private disputeModel: Model<AppraisalDisputeDocument>,
    @InjectModel(EmployeeProfile.name) private employeeProfileModel: Model<EmployeeProfileDocument>,
  ) {}

  // Create a new appraisal template (Req 1)
  async createTemplate(dto: CreateAppraisalTemplateDto): Promise<AppraisalTemplate> {
    const template = new this.templateModel(dto);
    try {
  return await template.save();
} catch (error) {
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
  return await cycle.save();
} catch (error) {
  console.error('Error saving cycle:', error);
  throw error;
}
}

  // Get all appraisal cycles
  async getAllCycles(): Promise<AppraisalCycle[]> {
    return this.cycleModel.find().exec();
  }

  //Assign appraisal template/cycle to employees and managers in bulk (Req 3)
async assignAppraisalsBulk(dtos: CreateAppraisalAssignmentDTO[]): Promise<AppraisalAssignment[]> {
  const savedAssignments = await Promise.all(
  dtos.map(dto => {
    const assignment = new this.assignmentModel({
      ...dto,
      cycleId: new Types.ObjectId(dto.cycleId),
      templateId: new Types.ObjectId(dto.templateId),
      employeeProfileId: new Types.ObjectId(dto.employeeProfileId),
      managerProfileId: new Types.ObjectId(dto.managerProfileId),
      departmentId: new Types.ObjectId(dto.departmentId),
      positionId: dto.positionId ? new Types.ObjectId(dto.positionId) : undefined,
      latestAppraisalId: dto.latestAppraisalId ? new Types.ObjectId(dto.latestAppraisalId) : undefined,
    });
    return assignment.save();
  })
);
return savedAssignments;

}

// Get all appraisal assignments for a specific manager (Req 4)
 async getAssignmentsForManager(managerId: string): Promise<AppraisalAssignment[]> {
    return this.assignmentModel
      .find({ managerProfileId: managerId })
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
  return await record.save();
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
    const assignments = await this.assignmentModel.aggregate([
      { $match: { cycleId: new Types.ObjectId(cycleId) } },
      {
        $group: {
          _id: '$departmentId',
          total: { $sum: 1 },
          notStarted: { $sum: { $cond: [{ $eq: ['$status', AppraisalAssignmentStatus.NOT_STARTED] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', AppraisalAssignmentStatus.IN_PROGRESS] }, 1, 0] } },
          submitted: { $sum: { $cond: [{ $eq: ['$status', AppraisalAssignmentStatus.SUBMITTED] }, 1, 0] } },
          published: { $sum: { $cond: [{ $eq: ['$status', AppraisalAssignmentStatus.PUBLISHED] }, 1, 0] } },
          acknowledged: { $sum: { $cond: [{ $eq: ['$status', AppraisalAssignmentStatus.ACKNOWLEDGED] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          departmentId: '$_id',
          total: 1,
          notStarted: 1,
          inProgress: 1,
          submitted: 1,
          published: 1,
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

    return assignments;
  }

  // REQ-AE-06: Monitor appraisal progress and get pending forms (Req 8)
  async getAppraisalProgress(cycleId: string): Promise<AppraisalAssignment[]> {
    return this.assignmentModel
      .find({
        cycleId: new Types.ObjectId(cycleId),
        status: {
          $in: [
            AppraisalAssignmentStatus.NOT_STARTED,
            AppraisalAssignmentStatus.IN_PROGRESS,
            AppraisalAssignmentStatus.SUBMITTED,
          ],
        },
      })
      .exec();
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
      .populate('cycleId', 'name cycleType startDate endDate')
      .populate('templateId', 'name templateType ratingScale')
      .populate('managerProfileId', 'employeeNumber')
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
}
