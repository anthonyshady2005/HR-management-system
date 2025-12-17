"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const common_2 = require("@nestjs/common");
const appraisal_template_schema_1 = require("./models/appraisal-template.schema");
const appraisal_cycle_schema_1 = require("./models/appraisal-cycle.schema");
const appraisal_assignment_schema_1 = require("./models/appraisal-assignment.schema");
const appraisal_record_schema_1 = require("./models/appraisal-record.schema");
const appraisal_dispute_schema_1 = require("./models/appraisal-dispute.schema");
const employee_profile_schema_1 = require("../employee-profile/models/employee-profile.schema");
const performance_enums_1 = require("../performance/enums/performance.enums");
const mongoose_3 = require("mongoose");
const uuid_1 = require("uuid");
let PerformanceService = class PerformanceService {
    templateModel;
    cycleModel;
    assignmentModel;
    recordModel;
    disputeModel;
    employeeProfileModel;
    constructor(templateModel, cycleModel, assignmentModel, recordModel, disputeModel, employeeProfileModel) {
        this.templateModel = templateModel;
        this.cycleModel = cycleModel;
        this.assignmentModel = assignmentModel;
        this.recordModel = recordModel;
        this.disputeModel = disputeModel;
        this.employeeProfileModel = employeeProfileModel;
    }
    async createTemplate(dto) {
        const template = new this.templateModel(dto);
        try {
            return await template.save();
        }
        catch (error) {
            console.error('Error saving template:', error);
            throw error;
        }
    }
    async getAllTemplates() {
        return this.templateModel.find().exec();
    }
    async createCycle(dto) {
        const cycle = new this.cycleModel(dto);
        try {
            return await cycle.save();
        }
        catch (error) {
            console.error('Error saving cycle:', error);
            throw error;
        }
    }
    async getAllCycles() {
        return this.cycleModel.find().exec();
    }
    async assignAppraisalsBulk(dtos) {
        const savedAssignments = await Promise.all(dtos.map(dto => {
            const assignment = new this.assignmentModel({
                ...dto,
                cycleId: new mongoose_3.Types.ObjectId(dto.cycleId),
                templateId: new mongoose_3.Types.ObjectId(dto.templateId),
                employeeProfileId: new mongoose_3.Types.ObjectId(dto.employeeProfileId),
                managerProfileId: new mongoose_3.Types.ObjectId(dto.managerProfileId),
                departmentId: new mongoose_3.Types.ObjectId(dto.departmentId),
                positionId: dto.positionId ? new mongoose_3.Types.ObjectId(dto.positionId) : undefined,
                latestAppraisalId: dto.latestAppraisalId ? new mongoose_3.Types.ObjectId(dto.latestAppraisalId) : undefined,
            });
            return assignment.save();
        }));
        return savedAssignments;
    }
    async getAssignmentsForManager(managerId) {
        return this.assignmentModel
            .find({ managerProfileId: managerId })
            .exec();
    }
    async getAllAssignments() {
        return this.assignmentModel.find().exec();
    }
    async createAppraisalRecord(dto) {
        const record = new this.recordModel(dto);
        try {
            return await record.save();
        }
        catch (error) {
            console.error('Error saving record:', error);
            throw error;
        }
    }
    async getRecords() {
        return this.recordModel.find().sort({ createdAt: -1 }).exec();
    }
    async updateAppraisalRecord(recordId, dto) {
        const record = await this.recordModel.findByIdAndUpdate(recordId, dto, { new: true }).exec();
        if (!record) {
            throw new Error('Appraisal record not found');
        }
        if (dto.status === performance_enums_1.AppraisalRecordStatus.HR_PUBLISHED) {
            const template = await this.templateModel.findById(record.templateId).exec();
            await this.employeeProfileModel.findByIdAndUpdate(record.employeeProfileId, {
                lastAppraisalRecordId: record._id,
                lastAppraisalCycleId: record.cycleId,
                lastAppraisalTemplateId: record.templateId,
                lastAppraisalDate: dto.hrPublishedAt || new Date(),
                lastAppraisalScore: record.totalScore,
                lastAppraisalRatingLabel: record.overallRatingLabel,
                lastAppraisalScaleType: template?.ratingScale?.type,
                lastDevelopmentPlanSummary: record.improvementAreas,
            }).exec();
        }
        return record;
    }
    async getDashboard(cycleId) {
        const assignments = await this.assignmentModel.aggregate([
            { $match: { cycleId: new mongoose_3.Types.ObjectId(cycleId) } },
            {
                $group: {
                    _id: '$departmentId',
                    total: { $sum: 1 },
                    notStarted: { $sum: { $cond: [{ $eq: ['$status', performance_enums_1.AppraisalAssignmentStatus.NOT_STARTED] }, 1, 0] } },
                    inProgress: { $sum: { $cond: [{ $eq: ['$status', performance_enums_1.AppraisalAssignmentStatus.IN_PROGRESS] }, 1, 0] } },
                    submitted: { $sum: { $cond: [{ $eq: ['$status', performance_enums_1.AppraisalAssignmentStatus.SUBMITTED] }, 1, 0] } },
                    published: { $sum: { $cond: [{ $eq: ['$status', performance_enums_1.AppraisalAssignmentStatus.PUBLISHED] }, 1, 0] } },
                    acknowledged: { $sum: { $cond: [{ $eq: ['$status', performance_enums_1.AppraisalAssignmentStatus.ACKNOWLEDGED] }, 1, 0] } },
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
    async getAppraisalProgress(cycleId) {
        return this.assignmentModel
            .find({
            cycleId: new mongoose_3.Types.ObjectId(cycleId),
            status: {
                $in: [
                    performance_enums_1.AppraisalAssignmentStatus.NOT_STARTED,
                    performance_enums_1.AppraisalAssignmentStatus.IN_PROGRESS,
                    performance_enums_1.AppraisalAssignmentStatus.SUBMITTED,
                ],
            },
        })
            .exec();
    }
    async getEmployeeAppraisals(employeeId) {
        return this.recordModel
            .find({ employeeProfileId: employeeId })
            .populate('cycleId', 'name cycleType startDate endDate')
            .populate('templateId', 'name')
            .populate('managerProfileId', 'employeeNumber')
            .exec();
    }
    async createAppraisalDispute(dto) {
        const idFields = ['appraisalId', 'assignmentId', 'cycleId', 'raisedByEmployeeId'];
        for (const field of idFields) {
            if (!mongoose_3.Types.ObjectId.isValid(dto[field])) {
                throw new common_2.BadRequestException(`Invalid ObjectId for ${field}`);
            }
        }
        const appraisal = await this.recordModel.findById(dto.appraisalId).exec();
        if (!appraisal || !appraisal.hrPublishedAt) {
            throw new common_2.BadRequestException('Appraisal record or publication date not found');
        }
        const daysSincePublication = Math.floor((new Date().getTime() - new Date(appraisal.hrPublishedAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSincePublication > 7) {
            throw new common_2.BadRequestException('Dispute must be filed within 7 days of appraisal publication');
        }
        const dispute = new this.disputeModel({
            _id: (0, uuid_1.v4)(),
            appraisalId: new mongoose_3.Types.ObjectId(dto.appraisalId),
            assignmentId: new mongoose_3.Types.ObjectId(dto.assignmentId),
            cycleId: new mongoose_3.Types.ObjectId(dto.cycleId),
            raisedByEmployeeId: new mongoose_3.Types.ObjectId(dto.raisedByEmployeeId),
            reason: dto.reason,
            status: dto.status || 'OPEN',
        });
        return await dispute.save();
    }
    async updateAppraisalDispute(disputeId, dto) {
        const dispute = await this.disputeModel.findByIdAndUpdate(disputeId, dto, { new: true }).exec();
        if (!dispute) {
            throw new Error('Appraisal dispute not found');
        }
        return dispute;
    }
    async getAllDisputes() {
        return this.disputeModel
            .find()
            .populate('appraisalId')
            .populate('assignmentId')
            .populate('cycleId', 'name')
            .populate('raisedByEmployeeId', 'employeeNumber')
            .populate('assignedReviewerEmployeeId', 'employeeNumber')
            .exec();
    }
    async publishAppraisal(recordId, publishedByEmployeeId) {
        const record = await this.recordModel.findById(recordId).exec();
        if (!record) {
            throw new Error('Appraisal record not found');
        }
        const updatedRecord = await this.recordModel.findByIdAndUpdate(recordId, {
            status: performance_enums_1.AppraisalRecordStatus.HR_PUBLISHED,
            hrPublishedAt: new Date(),
            publishedByEmployeeId: new mongoose_3.Types.ObjectId(publishedByEmployeeId),
        }, { new: true }).exec();
        if (!updatedRecord) {
            throw new Error('Failed to update appraisal record');
        }
        const template = await this.templateModel.findById(record.templateId).exec();
        await this.employeeProfileModel.findByIdAndUpdate(record.employeeProfileId, {
            lastAppraisalRecordId: updatedRecord._id,
            lastAppraisalCycleId: record.cycleId,
            lastAppraisalTemplateId: record.templateId,
            lastAppraisalDate: new Date(),
            lastAppraisalScore: updatedRecord.totalScore,
            lastAppraisalRatingLabel: updatedRecord.overallRatingLabel,
            lastAppraisalScaleType: template?.ratingScale?.type,
            lastDevelopmentPlanSummary: updatedRecord.improvementAreas,
        }).exec();
        return updatedRecord;
    }
    async getEmployeeAppraisalHistory(employeeId) {
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
    async generateAppraisalReport(cycleId) {
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
        const published = records.filter(r => r.status === performance_enums_1.AppraisalRecordStatus.HR_PUBLISHED).length;
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
};
exports.PerformanceService = PerformanceService;
exports.PerformanceService = PerformanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(appraisal_template_schema_1.AppraisalTemplate.name)),
    __param(1, (0, mongoose_1.InjectModel)(appraisal_cycle_schema_1.AppraisalCycle.name)),
    __param(2, (0, mongoose_1.InjectModel)(appraisal_assignment_schema_1.AppraisalAssignment.name)),
    __param(3, (0, mongoose_1.InjectModel)(appraisal_record_schema_1.AppraisalRecord.name)),
    __param(4, (0, mongoose_1.InjectModel)(appraisal_dispute_schema_1.AppraisalDispute.name)),
    __param(5, (0, mongoose_1.InjectModel)(employee_profile_schema_1.EmployeeProfile.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], PerformanceService);
//# sourceMappingURL=performance.service.js.map