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
exports.RecruitmentService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const job_template_schema_1 = require("./models/job-template.schema");
const job_requisition_schema_1 = require("./models/job-requisition.schema");
const application_schema_1 = require("./models/application.schema");
const application_history_schema_1 = require("./models/application-history.schema");
const interview_schema_1 = require("./models/interview.schema");
const assessment_result_schema_1 = require("./models/assessment-result.schema");
const offer_schema_1 = require("./models/offer.schema");
const contract_schema_1 = require("./models/contract.schema");
const onboarding_schema_1 = require("./models/onboarding.schema");
const termination_request_schema_1 = require("./models/termination-request.schema");
const clearance_checklist_schema_1 = require("./models/clearance-checklist.schema");
const referral_schema_1 = require("./models/referral.schema");
const document_schema_1 = require("./models/document.schema");
const application_stage_enum_1 = require("./enums/application-stage.enum");
const application_status_enum_1 = require("./enums/application-status.enum");
const interview_status_enum_1 = require("./enums/interview-status.enum");
const offer_response_status_enum_1 = require("./enums/offer-response-status.enum");
const offer_final_status_enum_1 = require("./enums/offer-final-status.enum");
const approval_status_enum_1 = require("./enums/approval-status.enum");
const termination_status_enum_1 = require("./enums/termination-status.enum");
const employee_profile_service_1 = require("../employee-profile/employee-profile.service");
let RecruitmentService = class RecruitmentService {
    jobTemplateModel;
    jobRequisitionModel;
    applicationModel;
    applicationHistoryModel;
    interviewModel;
    assessmentResultModel;
    offerModel;
    contractModel;
    onboardingModel;
    terminationRequestModel;
    clearanceChecklistModel;
    referralModel;
    documentModel;
    employeeProfileService;
    constructor(jobTemplateModel, jobRequisitionModel, applicationModel, applicationHistoryModel, interviewModel, assessmentResultModel, offerModel, contractModel, onboardingModel, terminationRequestModel, clearanceChecklistModel, referralModel, documentModel, employeeProfileService) {
        this.jobTemplateModel = jobTemplateModel;
        this.jobRequisitionModel = jobRequisitionModel;
        this.applicationModel = applicationModel;
        this.applicationHistoryModel = applicationHistoryModel;
        this.interviewModel = interviewModel;
        this.assessmentResultModel = assessmentResultModel;
        this.offerModel = offerModel;
        this.contractModel = contractModel;
        this.onboardingModel = onboardingModel;
        this.terminationRequestModel = terminationRequestModel;
        this.clearanceChecklistModel = clearanceChecklistModel;
        this.referralModel = referralModel;
        this.documentModel = documentModel;
        this.employeeProfileService = employeeProfileService;
    }
    async createJobTemplate(createDto) {
        const jobTemplate = new this.jobTemplateModel(createDto);
        return await jobTemplate.save();
    }
    async findAllJobTemplates(filters) {
        const query = this.jobTemplateModel.find();
        if (filters?.department) {
            query.where('department').equals(filters.department);
        }
        if (filters?.title) {
            query.where('title').regex(new RegExp(filters.title, 'i'));
        }
        return await query.exec();
    }
    async findJobTemplateById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid job template ID');
        }
        const template = await this.jobTemplateModel.findById(id).exec();
        if (!template) {
            throw new common_1.NotFoundException(`Job template with ID ${id} not found`);
        }
        return template;
    }
    async updateJobTemplate(id, updateDto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid job template ID');
        }
        const template = await this.jobTemplateModel
            .findByIdAndUpdate(id, updateDto, { new: true, runValidators: true })
            .exec();
        if (!template) {
            throw new common_1.NotFoundException(`Job template with ID ${id} not found`);
        }
        return template;
    }
    async deleteJobTemplate(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid job template ID');
        }
        const template = await this.jobTemplateModel.findByIdAndDelete(id).exec();
        if (!template) {
            throw new common_1.NotFoundException(`Job template with ID ${id} not found`);
        }
    }
    async createJobRequisition(createDto) {
        if (createDto.templateId && !mongoose_2.Types.ObjectId.isValid(createDto.templateId)) {
            throw new common_1.BadRequestException('Invalid template ID');
        }
        if (!mongoose_2.Types.ObjectId.isValid(createDto.hiringManagerId)) {
            throw new common_1.BadRequestException('Invalid hiring manager ID');
        }
        const requisition = new this.jobRequisitionModel({
            ...createDto,
            templateId: createDto.templateId
                ? new mongoose_2.Types.ObjectId(createDto.templateId)
                : undefined,
            hiringManagerId: new mongoose_2.Types.ObjectId(createDto.hiringManagerId),
            postingDate: createDto.postingDate
                ? new Date(createDto.postingDate)
                : undefined,
            expiryDate: createDto.expiryDate
                ? new Date(createDto.expiryDate)
                : undefined,
        });
        return await requisition.save();
    }
    async findAllJobRequisitions(filters) {
        const query = this.jobRequisitionModel.find().populate('templateId').populate('hiringManagerId');
        if (filters?.publishStatus) {
            query.where('publishStatus').equals(filters.publishStatus);
        }
        if (filters?.hiringManagerId) {
            query.where('hiringManagerId').equals(filters.hiringManagerId);
        }
        if (filters?.location) {
            query.where('location').regex(new RegExp(filters.location, 'i'));
        }
        return await query.exec();
    }
    async findJobRequisitionById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid job requisition ID');
        }
        const requisition = await this.jobRequisitionModel
            .findById(id)
            .populate('templateId')
            .populate('hiringManagerId')
            .exec();
        if (!requisition) {
            throw new common_1.NotFoundException(`Job requisition with ID ${id} not found`);
        }
        return requisition;
    }
    async updateJobRequisition(id, updateDto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid job requisition ID');
        }
        const updateData = { ...updateDto };
        if (updateDto.templateId) {
            updateData.templateId = new mongoose_2.Types.ObjectId(updateDto.templateId);
        }
        if (updateDto.hiringManagerId) {
            updateData.hiringManagerId = new mongoose_2.Types.ObjectId(updateDto.hiringManagerId);
        }
        if (updateDto.postingDate) {
            updateData.postingDate = new Date(updateDto.postingDate);
        }
        if (updateDto.expiryDate) {
            updateData.expiryDate = new Date(updateDto.expiryDate);
        }
        const requisition = await this.jobRequisitionModel
            .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate('templateId')
            .populate('hiringManagerId')
            .exec();
        if (!requisition) {
            throw new common_1.NotFoundException(`Job requisition with ID ${id} not found`);
        }
        return requisition;
    }
    async publishJobRequisition(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid job requisition ID');
        }
        const requisition = await this.jobRequisitionModel.findById(id).exec();
        if (!requisition) {
            throw new common_1.NotFoundException(`Job requisition with ID ${id} not found`);
        }
        if (requisition.publishStatus === 'published') {
            throw new common_1.BadRequestException('Job requisition is already published');
        }
        if (requisition.publishStatus === 'closed') {
            throw new common_1.BadRequestException('Cannot publish a closed job requisition');
        }
        requisition.publishStatus = 'published';
        if (!requisition.postingDate) {
            requisition.postingDate = new Date();
        }
        return await requisition.save();
    }
    async closeJobRequisition(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid job requisition ID');
        }
        const requisition = await this.jobRequisitionModel.findById(id).exec();
        if (!requisition) {
            throw new common_1.NotFoundException(`Job requisition with ID ${id} not found`);
        }
        requisition.publishStatus = 'closed';
        return await requisition.save();
    }
    async previewJobRequisition(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid job requisition ID');
        }
        const requisition = await this.jobRequisitionModel
            .findById(id)
            .populate('templateId')
            .populate('hiringManagerId')
            .exec();
        if (!requisition) {
            throw new common_1.NotFoundException(`Job requisition with ID ${id} not found`);
        }
        return {
            requisitionId: requisition.requisitionId,
            template: requisition.templateId,
            openings: requisition.openings,
            location: requisition.location,
            hiringManager: requisition.hiringManagerId,
            publishStatus: requisition.publishStatus,
            postingDate: requisition.postingDate,
            expiryDate: requisition.expiryDate,
        };
    }
    async deleteJobRequisition(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid job requisition ID');
        }
        const activeApplications = await this.applicationModel
            .countDocuments({ requisitionId: new mongoose_2.Types.ObjectId(id) })
            .exec();
        if (activeApplications > 0) {
            throw new common_1.ConflictException('Cannot delete job requisition with active applications');
        }
        const requisition = await this.jobRequisitionModel
            .findByIdAndDelete(id)
            .exec();
        if (!requisition) {
            throw new common_1.NotFoundException(`Job requisition with ID ${id} not found`);
        }
    }
    async createApplication(createDto) {
        if (!mongoose_2.Types.ObjectId.isValid(createDto.candidateId)) {
            throw new common_1.BadRequestException('Invalid candidate ID');
        }
        if (!mongoose_2.Types.ObjectId.isValid(createDto.requisitionId)) {
            throw new common_1.BadRequestException('Invalid requisition ID');
        }
        const requisition = await this.jobRequisitionModel
            .findById(createDto.requisitionId)
            .exec();
        if (!requisition) {
            throw new common_1.NotFoundException(`Job requisition with ID ${createDto.requisitionId} not found`);
        }
        const existingApplication = await this.applicationModel
            .findOne({
            candidateId: new mongoose_2.Types.ObjectId(createDto.candidateId),
            requisitionId: new mongoose_2.Types.ObjectId(createDto.requisitionId),
        })
            .exec();
        if (existingApplication) {
            throw new common_1.ConflictException('Application already exists for this candidate and requisition');
        }
        const application = new this.applicationModel({
            candidateId: new mongoose_2.Types.ObjectId(createDto.candidateId),
            requisitionId: new mongoose_2.Types.ObjectId(createDto.requisitionId),
            assignedHr: createDto.assignedHr
                ? new mongoose_2.Types.ObjectId(createDto.assignedHr)
                : undefined,
            currentStage: application_stage_enum_1.ApplicationStage.SCREENING,
            status: application_status_enum_1.ApplicationStatus.SUBMITTED,
        });
        const savedApplication = await application.save();
        await this.createApplicationHistoryEntry(savedApplication._id.toString(), null, application_stage_enum_1.ApplicationStage.SCREENING, null, application_status_enum_1.ApplicationStatus.SUBMITTED, createDto.assignedHr || createDto.candidateId);
        return savedApplication;
    }
    async findAllApplications(filters) {
        const query = this.applicationModel
            .find()
            .populate('candidateId')
            .populate('requisitionId')
            .populate('assignedHr');
        if (filters?.status) {
            query.where('status').equals(filters.status);
        }
        if (filters?.currentStage) {
            query.where('currentStage').equals(filters.currentStage);
        }
        if (filters?.requisitionId) {
            query.where('requisitionId').equals(filters.requisitionId);
        }
        if (filters?.candidateId) {
            query.where('candidateId').equals(filters.candidateId);
        }
        if (filters?.assignedHr) {
            query.where('assignedHr').equals(filters.assignedHr);
        }
        return await query.exec();
    }
    async findApplicationById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid application ID');
        }
        const application = await this.applicationModel
            .findById(id)
            .populate('candidateId')
            .populate('requisitionId')
            .populate('assignedHr')
            .exec();
        if (!application) {
            throw new common_1.NotFoundException(`Application with ID ${id} not found`);
        }
        return application;
    }
    async updateApplicationStage(id, updateDto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid application ID');
        }
        const application = await this.applicationModel.findById(id).exec();
        if (!application) {
            throw new common_1.NotFoundException(`Application with ID ${id} not found`);
        }
        const oldStage = application.currentStage;
        application.currentStage = updateDto.currentStage;
        const updated = await application.save();
        await this.createApplicationHistoryEntry(id, oldStage, updateDto.currentStage, application.status, application.status, application.assignedHr?.toString() || application.candidateId.toString());
        return updated;
    }
    async updateApplicationStatus(id, updateDto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid application ID');
        }
        const application = await this.applicationModel.findById(id).exec();
        if (!application) {
            throw new common_1.NotFoundException(`Application with ID ${id} not found`);
        }
        const oldStatus = application.status;
        application.status = updateDto.status;
        const updated = await application.save();
        await this.createApplicationHistoryEntry(id, application.currentStage, application.currentStage, oldStatus, updateDto.status, application.assignedHr?.toString() || application.candidateId.toString());
        return updated;
    }
    async assignHrToApplication(id, hrId) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid application ID');
        }
        if (!mongoose_2.Types.ObjectId.isValid(hrId)) {
            throw new common_1.BadRequestException('Invalid HR employee ID');
        }
        const application = await this.applicationModel
            .findByIdAndUpdate(id, { assignedHr: new mongoose_2.Types.ObjectId(hrId) }, { new: true, runValidators: true })
            .exec();
        if (!application) {
            throw new common_1.NotFoundException(`Application with ID ${id} not found`);
        }
        return application;
    }
    async getApplicationHistory(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid application ID');
        }
        return await this.applicationHistoryModel
            .find({ applicationId: new mongoose_2.Types.ObjectId(id) })
            .populate('changedBy')
            .sort({ createdAt: -1 })
            .exec();
    }
    async getApplicationCommunicationLogs(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid application ID');
        }
        return [];
    }
    async recordConsent(id, consentDto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid application ID');
        }
        return { applicationId: id, ...consentDto };
    }
    async getConsentStatus(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid application ID');
        }
        return { applicationId: id, consentGiven: false };
    }
    async createInterview(createDto) {
        if (!mongoose_2.Types.ObjectId.isValid(createDto.applicationId)) {
            throw new common_1.BadRequestException('Invalid application ID');
        }
        const application = await this.applicationModel
            .findById(createDto.applicationId)
            .exec();
        if (!application) {
            throw new common_1.NotFoundException(`Application with ID ${createDto.applicationId} not found`);
        }
        const interview = new this.interviewModel({
            applicationId: new mongoose_2.Types.ObjectId(createDto.applicationId),
            stage: createDto.stage,
            scheduledDate: createDto.scheduledDate
                ? new Date(createDto.scheduledDate)
                : undefined,
            method: createDto.method,
            panel: createDto.panel
                ? createDto.panel.map((id) => new mongoose_2.Types.ObjectId(id))
                : [],
            calendarEventId: createDto.calendarEventId,
            videoLink: createDto.videoLink,
            status: interview_status_enum_1.InterviewStatus.SCHEDULED,
        });
        return await interview.save();
    }
    async findAllInterviews(filters) {
        const query = this.interviewModel
            .find()
            .populate('applicationId')
            .populate('panel')
            .populate('feedbackId');
        if (filters?.status) {
            query.where('status').equals(filters.status);
        }
        if (filters?.applicationId) {
            query.where('applicationId').equals(filters.applicationId);
        }
        if (filters?.stage) {
            query.where('stage').equals(filters.stage);
        }
        if (filters?.scheduledDate) {
            query.where('scheduledDate').gte(filters.scheduledDate);
        }
        return await query.exec();
    }
    async findInterviewById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid interview ID');
        }
        const interview = await this.interviewModel
            .findById(id)
            .populate('applicationId')
            .populate('panel')
            .populate('feedbackId')
            .exec();
        if (!interview) {
            throw new common_1.NotFoundException(`Interview with ID ${id} not found`);
        }
        return interview;
    }
    async updateInterview(id, updateDto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid interview ID');
        }
        const updateData = { ...updateDto };
        if (updateDto.scheduledDate) {
            updateData.scheduledDate = new Date(updateDto.scheduledDate);
        }
        if (updateDto.panel) {
            updateData.panel = updateDto.panel.map((panelId) => new mongoose_2.Types.ObjectId(panelId));
        }
        if (updateDto.feedbackId) {
            updateData.feedbackId = new mongoose_2.Types.ObjectId(updateDto.feedbackId);
        }
        const interview = await this.interviewModel
            .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate('applicationId')
            .populate('panel')
            .populate('feedbackId')
            .exec();
        if (!interview) {
            throw new common_1.NotFoundException(`Interview with ID ${id} not found`);
        }
        return interview;
    }
    async updateInterviewStatus(id, status) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid interview ID');
        }
        const interview = await this.interviewModel
            .findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
            .exec();
        if (!interview) {
            throw new common_1.NotFoundException(`Interview with ID ${id} not found`);
        }
        return interview;
    }
    async createAssessmentResult(createDto) {
        if (!mongoose_2.Types.ObjectId.isValid(createDto.interviewId)) {
            throw new common_1.BadRequestException('Invalid interview ID');
        }
        if (!mongoose_2.Types.ObjectId.isValid(createDto.interviewerId)) {
            throw new common_1.BadRequestException('Invalid interviewer ID');
        }
        const interview = await this.interviewModel
            .findById(createDto.interviewId)
            .exec();
        if (!interview) {
            throw new common_1.NotFoundException(`Interview with ID ${createDto.interviewId} not found`);
        }
        const assessment = new this.assessmentResultModel({
            interviewId: new mongoose_2.Types.ObjectId(createDto.interviewId),
            interviewerId: new mongoose_2.Types.ObjectId(createDto.interviewerId),
            score: createDto.score,
            comments: createDto.comments,
        });
        const savedAssessment = await assessment.save();
        await this.interviewModel
            .findByIdAndUpdate(createDto.interviewId, {
            feedbackId: savedAssessment._id,
        })
            .exec();
        return savedAssessment;
    }
    async getInterviewAssessment(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid interview ID');
        }
        const interview = await this.interviewModel.findById(id).exec();
        if (!interview) {
            throw new common_1.NotFoundException(`Interview with ID ${id} not found`);
        }
        if (!interview.feedbackId) {
            return null;
        }
        return await this.assessmentResultModel
            .findById(interview.feedbackId)
            .populate('interviewerId')
            .exec();
    }
    async sendCalendarInvite(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid interview ID');
        }
        const interview = await this.interviewModel
            .findById(id)
            .populate('applicationId')
            .populate('panel')
            .exec();
        if (!interview) {
            throw new common_1.NotFoundException(`Interview with ID ${id} not found`);
        }
        return {
            interviewId: id,
            scheduledDate: interview.scheduledDate,
            calendarEventId: interview.calendarEventId,
            message: 'Calendar invite sent successfully',
        };
    }
    async createOffer(createDto) {
        if (!mongoose_2.Types.ObjectId.isValid(createDto.applicationId)) {
            throw new common_1.BadRequestException('Invalid application ID');
        }
        if (!mongoose_2.Types.ObjectId.isValid(createDto.candidateId)) {
            throw new common_1.BadRequestException('Invalid candidate ID');
        }
        const application = await this.applicationModel
            .findById(createDto.applicationId)
            .exec();
        if (!application) {
            throw new common_1.NotFoundException(`Application with ID ${createDto.applicationId} not found`);
        }
        const existingOffer = await this.offerModel
            .findOne({ applicationId: new mongoose_2.Types.ObjectId(createDto.applicationId) })
            .exec();
        if (existingOffer) {
            throw new common_1.ConflictException('Offer already exists for this application');
        }
        const offer = new this.offerModel({
            applicationId: new mongoose_2.Types.ObjectId(createDto.applicationId),
            candidateId: new mongoose_2.Types.ObjectId(createDto.candidateId),
            hrEmployeeId: createDto.hrEmployeeId
                ? new mongoose_2.Types.ObjectId(createDto.hrEmployeeId)
                : undefined,
            grossSalary: createDto.grossSalary,
            signingBonus: createDto.signingBonus,
            benefits: createDto.benefits,
            conditions: createDto.conditions,
            insurances: createDto.insurances,
            content: createDto.content,
            role: createDto.role,
            deadline: new Date(createDto.deadline),
            approvers: createDto.approvers
                ? createDto.approvers.map((approver) => ({
                    employeeId: new mongoose_2.Types.ObjectId(approver.employeeId),
                    role: approver.role,
                    status: approver.status,
                    actionDate: approver.actionDate
                        ? new Date(approver.actionDate)
                        : undefined,
                    comment: approver.comment,
                }))
                : [],
            applicantResponse: offer_response_status_enum_1.OfferResponseStatus.PENDING,
            finalStatus: createDto.approvers?.length
                ? approval_status_enum_1.ApprovalStatus.PENDING
                : approval_status_enum_1.ApprovalStatus.APPROVED,
        });
        const savedOffer = await offer.save();
        await this.applicationModel
            .findByIdAndUpdate(createDto.applicationId, {
            status: application_status_enum_1.ApplicationStatus.OFFER,
            currentStage: application_stage_enum_1.ApplicationStage.OFFER,
        })
            .exec();
        await this.createApplicationHistoryEntry(createDto.applicationId, application.currentStage, application_stage_enum_1.ApplicationStage.OFFER, application.status, application_status_enum_1.ApplicationStatus.OFFER, createDto.hrEmployeeId || application.assignedHr?.toString() || '');
        return savedOffer;
    }
    async findAllOffers(filters) {
        const query = this.offerModel
            .find()
            .populate('applicationId')
            .populate('candidateId')
            .populate('hrEmployeeId')
            .populate('approvers.employeeId');
        if (filters?.applicantResponse) {
            query.where('applicantResponse').equals(filters.applicantResponse);
        }
        if (filters?.finalStatus) {
            query.where('finalStatus').equals(filters.finalStatus);
        }
        if (filters?.candidateId) {
            query.where('candidateId').equals(filters.candidateId);
        }
        if (filters?.applicationId) {
            query.where('applicationId').equals(filters.applicationId);
        }
        return await query.exec();
    }
    async findOfferById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid offer ID');
        }
        const offer = await this.offerModel
            .findById(id)
            .populate('applicationId')
            .populate('candidateId')
            .populate('hrEmployeeId')
            .populate('approvers.employeeId')
            .exec();
        if (!offer) {
            throw new common_1.NotFoundException(`Offer with ID ${id} not found`);
        }
        return offer;
    }
    async updateOffer(id, updateDto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid offer ID');
        }
        const updateData = { ...updateDto };
        if (updateDto.deadline) {
            updateData.deadline = new Date(updateDto.deadline);
        }
        const offer = await this.offerModel
            .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate('applicationId')
            .populate('candidateId')
            .exec();
        if (!offer) {
            throw new common_1.NotFoundException(`Offer with ID ${id} not found`);
        }
        return offer;
    }
    async updateOfferResponse(id, response) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid offer ID');
        }
        const offer = await this.offerModel.findById(id).exec();
        if (!offer) {
            throw new common_1.NotFoundException(`Offer with ID ${id} not found`);
        }
        if (offer.applicantResponse !== offer_response_status_enum_1.OfferResponseStatus.PENDING) {
            throw new common_1.BadRequestException('Offer response has already been submitted');
        }
        offer.applicantResponse = response;
        const updated = await offer.save();
        if (response === offer_response_status_enum_1.OfferResponseStatus.ACCEPTED) {
            await this.applicationModel
                .findByIdAndUpdate(offer.applicationId, {
                status: application_status_enum_1.ApplicationStatus.HIRED,
            })
                .exec();
        }
        else if (response === offer_response_status_enum_1.OfferResponseStatus.REJECTED) {
            await this.applicationModel
                .findByIdAndUpdate(offer.applicationId, {
                status: application_status_enum_1.ApplicationStatus.REJECTED,
            })
                .exec();
        }
        return updated;
    }
    async updateOfferApproval(id, approverId, status) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid offer ID');
        }
        if (!mongoose_2.Types.ObjectId.isValid(approverId)) {
            throw new common_1.BadRequestException('Invalid approver ID');
        }
        const offer = await this.offerModel.findById(id).exec();
        if (!offer) {
            throw new common_1.NotFoundException(`Offer with ID ${id} not found`);
        }
        const approverIndex = offer.approvers.findIndex((a) => a.employeeId.toString() === approverId);
        if (approverIndex === -1) {
            throw new common_1.NotFoundException(`Approver with ID ${approverId} not found in offer approvers`);
        }
        offer.approvers[approverIndex].status = status;
        offer.approvers[approverIndex].actionDate = new Date();
        const allApproved = offer.approvers.every((a) => a.status === approval_status_enum_1.ApprovalStatus.APPROVED);
        const anyRejected = offer.approvers.some((a) => a.status === approval_status_enum_1.ApprovalStatus.REJECTED);
        if (anyRejected) {
            offer.finalStatus = offer_final_status_enum_1.OfferFinalStatus.REJECTED;
        }
        else if (allApproved) {
            offer.finalStatus = offer_final_status_enum_1.OfferFinalStatus.APPROVED;
        }
        return await offer.save();
    }
    async signOffer(id, signerType, signature) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid offer ID');
        }
        const offer = await this.offerModel.findById(id).exec();
        if (!offer) {
            throw new common_1.NotFoundException(`Offer with ID ${id} not found`);
        }
        const updateData = {};
        if (signerType === 'candidate') {
            updateData.candidateSignedAt = new Date();
        }
        else if (signerType === 'hr') {
            updateData.hrSignedAt = new Date();
        }
        else if (signerType === 'manager') {
            updateData.managerSignedAt = new Date();
        }
        const updated = await this.offerModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Offer with ID ${id} not found`);
        }
        return updated;
    }
    async generateOfferPDF(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid offer ID');
        }
        const offer = await this.findOfferById(id);
        return {
            offerId: id,
            pdfUrl: `/offers/${id}/pdf`,
            message: 'PDF generation not yet implemented',
        };
    }
    async sendOfferToCandidate(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid offer ID');
        }
        const offer = await this.findOfferById(id);
        return {
            offerId: id,
            candidateId: offer.candidateId,
            sent: true,
            message: 'Offer email sending not yet implemented',
        };
    }
    async createContract(createDto) {
        if (!mongoose_2.Types.ObjectId.isValid(createDto.offerId)) {
            throw new common_1.BadRequestException('Invalid offer ID');
        }
        if (!mongoose_2.Types.ObjectId.isValid(createDto.documentId)) {
            throw new common_1.BadRequestException('Invalid document ID');
        }
        const offer = await this.offerModel.findById(createDto.offerId).exec();
        if (!offer) {
            throw new common_1.NotFoundException(`Offer with ID ${createDto.offerId} not found`);
        }
        if (offer.applicantResponse !== offer_response_status_enum_1.OfferResponseStatus.ACCEPTED) {
            throw new common_1.BadRequestException('Cannot create contract from unaccepted offer');
        }
        const existingContract = await this.contractModel
            .findOne({ offerId: new mongoose_2.Types.ObjectId(createDto.offerId) })
            .exec();
        if (existingContract) {
            throw new common_1.ConflictException('Contract already exists for this offer');
        }
        const contract = new this.contractModel({
            offerId: new mongoose_2.Types.ObjectId(createDto.offerId),
            acceptanceDate: createDto.acceptanceDate
                ? new Date(createDto.acceptanceDate)
                : new Date(),
            grossSalary: createDto.grossSalary,
            signingBonus: createDto.signingBonus,
            role: createDto.role,
            benefits: createDto.benefits,
            documentId: new mongoose_2.Types.ObjectId(createDto.documentId),
            employeeSignatureUrl: createDto.employeeSignatureUrl,
            employerSignatureUrl: createDto.employerSignatureUrl,
            employeeSignedAt: createDto.employeeSignedAt
                ? new Date(createDto.employeeSignedAt)
                : undefined,
            employerSignedAt: createDto.employerSignedAt
                ? new Date(createDto.employerSignedAt)
                : undefined,
        });
        return await contract.save();
    }
    async findAllContracts(filters) {
        const query = this.contractModel
            .find()
            .populate('offerId')
            .populate('documentId');
        if (filters?.role) {
            query.where('role').regex(new RegExp(filters.role, 'i'));
        }
        return await query.exec();
    }
    async findContractById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid contract ID');
        }
        const contract = await this.contractModel
            .findById(id)
            .populate('offerId')
            .populate('documentId')
            .exec();
        if (!contract) {
            throw new common_1.NotFoundException(`Contract with ID ${id} not found`);
        }
        return contract;
    }
    async signContract(id, signerType, signatureUrl) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid contract ID');
        }
        const contract = await this.contractModel.findById(id).exec();
        if (!contract) {
            throw new common_1.NotFoundException(`Contract with ID ${id} not found`);
        }
        const updateData = {};
        if (signerType === 'employee') {
            updateData.employeeSignatureUrl = signatureUrl;
            updateData.employeeSignedAt = new Date();
        }
        else if (signerType === 'employer') {
            updateData.employerSignatureUrl = signatureUrl;
            updateData.employerSignedAt = new Date();
        }
        else {
            throw new common_1.BadRequestException('Invalid signer type');
        }
        const updated = await this.contractModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Contract with ID ${id} not found`);
        }
        return updated;
    }
    async generateContractPDF(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid contract ID');
        }
        const contract = await this.findContractById(id);
        return {
            contractId: id,
            pdfUrl: `/contracts/${id}/pdf`,
            message: 'PDF generation not yet implemented',
        };
    }
    async getContractByOfferId(offerId) {
        if (!mongoose_2.Types.ObjectId.isValid(offerId)) {
            throw new common_1.BadRequestException('Invalid offer ID');
        }
        return await this.contractModel
            .findOne({ offerId: new mongoose_2.Types.ObjectId(offerId) })
            .populate('offerId')
            .populate('documentId')
            .exec();
    }
    async createOnboarding(createDto) {
        if (!mongoose_2.Types.ObjectId.isValid(createDto.employeeId)) {
            throw new common_1.BadRequestException('Invalid employee ID');
        }
        const existing = await this.onboardingModel
            .findOne({ employeeId: new mongoose_2.Types.ObjectId(createDto.employeeId) })
            .exec();
        if (existing) {
            throw new common_1.ConflictException('Onboarding already exists for this employee');
        }
        const onboarding = new this.onboardingModel({
            employeeId: new mongoose_2.Types.ObjectId(createDto.employeeId),
            tasks: createDto.tasks
                ? createDto.tasks.map((task) => ({
                    name: task.name,
                    department: task.department,
                    status: task.status,
                    deadline: task.deadline ? new Date(task.deadline) : undefined,
                    completedAt: task.completedAt
                        ? new Date(task.completedAt)
                        : undefined,
                    documentId: task.documentId
                        ? new mongoose_2.Types.ObjectId(task.documentId)
                        : undefined,
                    notes: task.notes,
                }))
                : [],
            completed: createDto.completed || false,
            completedAt: createDto.completedAt
                ? new Date(createDto.completedAt)
                : undefined,
        });
        return await onboarding.save();
    }
    async findOnboardingByEmployeeId(employeeId) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId)) {
            throw new common_1.BadRequestException('Invalid employee ID');
        }
        return await this.onboardingModel
            .findOne({ employeeId: new mongoose_2.Types.ObjectId(employeeId) })
            .populate('tasks.documentId')
            .exec();
    }
    async updateOnboardingTask(id, taskId, updateDto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid onboarding ID');
        }
        const onboarding = await this.onboardingModel.findById(id).exec();
        if (!onboarding) {
            throw new common_1.NotFoundException(`Onboarding with ID ${id} not found`);
        }
        const taskIndex = parseInt(taskId, 10);
        if (isNaN(taskIndex) || taskIndex < 0 || taskIndex >= onboarding.tasks.length) {
            throw new common_1.NotFoundException(`Task with index ${taskId} not found`);
        }
        const task = onboarding.tasks[taskIndex];
        if (updateDto.status) {
            task.status = updateDto.status;
        }
        if (updateDto.completedAt) {
            task.completedAt = new Date(updateDto.completedAt);
        }
        if (updateDto.documentId) {
            task.documentId = new mongoose_2.Types.ObjectId(updateDto.documentId);
        }
        if (updateDto.notes !== undefined) {
            task.notes = updateDto.notes;
        }
        return await onboarding.save();
    }
    async completeOnboarding(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid onboarding ID');
        }
        const onboarding = await this.onboardingModel.findById(id).exec();
        if (!onboarding) {
            throw new common_1.NotFoundException(`Onboarding with ID ${id} not found`);
        }
        onboarding.completed = true;
        onboarding.completedAt = new Date();
        return await onboarding.save();
    }
    async getOnboardingTasks(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid onboarding ID');
        }
        const onboarding = await this.onboardingModel
            .findById(id)
            .populate('tasks.documentId')
            .exec();
        if (!onboarding) {
            throw new common_1.NotFoundException(`Onboarding with ID ${id} not found`);
        }
        return onboarding.tasks;
    }
    async createTerminationRequest(createDto) {
        if (!mongoose_2.Types.ObjectId.isValid(createDto.employeeId)) {
            throw new common_1.BadRequestException('Invalid employee ID');
        }
        if (!mongoose_2.Types.ObjectId.isValid(createDto.contractId)) {
            throw new common_1.BadRequestException('Invalid contract ID');
        }
        const termination = new this.terminationRequestModel({
            employeeId: new mongoose_2.Types.ObjectId(createDto.employeeId),
            initiator: createDto.initiator,
            reason: createDto.reason,
            employeeComments: createDto.employeeComments,
            hrComments: createDto.hrComments,
            terminationDate: createDto.terminationDate
                ? new Date(createDto.terminationDate)
                : undefined,
            contractId: new mongoose_2.Types.ObjectId(createDto.contractId),
            status: termination_status_enum_1.TerminationStatus.PENDING,
        });
        return await termination.save();
    }
    async findAllTerminationRequests(filters) {
        const query = this.terminationRequestModel
            .find()
            .populate('employeeId')
            .populate('contractId');
        if (filters?.status) {
            query.where('status').equals(filters.status);
        }
        if (filters?.employeeId) {
            query.where('employeeId').equals(filters.employeeId);
        }
        if (filters?.initiator) {
            query.where('initiator').equals(filters.initiator);
        }
        return await query.exec();
    }
    async findTerminationRequestById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid termination request ID');
        }
        const termination = await this.terminationRequestModel
            .findById(id)
            .populate('employeeId')
            .populate('contractId')
            .exec();
        if (!termination) {
            throw new common_1.NotFoundException(`Termination request with ID ${id} not found`);
        }
        return termination;
    }
    async updateTerminationStatus(id, status) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid termination request ID');
        }
        const termination = await this.terminationRequestModel
            .findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
            .exec();
        if (!termination) {
            throw new common_1.NotFoundException(`Termination request with ID ${id} not found`);
        }
        return termination;
    }
    async getClearanceChecklist(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid termination request ID');
        }
        const termination = await this.terminationRequestModel
            .findById(id)
            .exec();
        if (!termination) {
            throw new common_1.NotFoundException(`Termination request with ID ${id} not found`);
        }
        return await this.clearanceChecklistModel
            .findOne({ terminationId: new mongoose_2.Types.ObjectId(id) })
            .populate('items.updatedBy')
            .exec();
    }
    async updateClearanceChecklist(id, updateDto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid termination request ID');
        }
        const termination = await this.terminationRequestModel
            .findById(id)
            .exec();
        if (!termination) {
            throw new common_1.NotFoundException(`Termination request with ID ${id} not found`);
        }
        let checklist = await this.clearanceChecklistModel
            .findOne({ terminationId: new mongoose_2.Types.ObjectId(id) })
            .exec();
        if (!checklist) {
            checklist = new this.clearanceChecklistModel({
                terminationId: new mongoose_2.Types.ObjectId(id),
                items: updateDto.items
                    ? updateDto.items.map((item) => ({
                        department: item.department,
                        status: item.status || approval_status_enum_1.ApprovalStatus.PENDING,
                        comments: item.comments,
                        updatedBy: item.updatedBy
                            ? new mongoose_2.Types.ObjectId(item.updatedBy)
                            : undefined,
                        updatedAt: new Date(),
                    }))
                    : [],
                equipmentList: updateDto.equipmentList
                    ? updateDto.equipmentList.map((equipment) => ({
                        equipmentId: equipment.equipmentId
                            ? new mongoose_2.Types.ObjectId(equipment.equipmentId)
                            : undefined,
                        name: equipment.name,
                        returned: equipment.returned || false,
                        condition: equipment.condition,
                    }))
                    : [],
                cardReturned: updateDto.cardReturned || false,
            });
        }
        else {
            if (updateDto.items) {
                checklist.items = updateDto.items.map((item) => ({
                    department: item.department,
                    status: item.status || approval_status_enum_1.ApprovalStatus.PENDING,
                    comments: item.comments,
                    updatedBy: item.updatedBy
                        ? new mongoose_2.Types.ObjectId(item.updatedBy)
                        : undefined,
                    updatedAt: new Date(),
                }));
            }
            if (updateDto.equipmentList) {
                checklist.equipmentList = updateDto.equipmentList.map((equipment) => ({
                    equipmentId: equipment.equipmentId
                        ? new mongoose_2.Types.ObjectId(equipment.equipmentId)
                        : undefined,
                    name: equipment.name,
                    returned: equipment.returned || false,
                    condition: equipment.condition,
                }));
            }
            if (updateDto.cardReturned !== undefined) {
                checklist.cardReturned = updateDto.cardReturned;
            }
        }
        return await checklist.save();
    }
    async createReferral(createDto) {
        if (!mongoose_2.Types.ObjectId.isValid(createDto.referringEmployeeId)) {
            throw new common_1.BadRequestException('Invalid referring employee ID');
        }
        if (!mongoose_2.Types.ObjectId.isValid(createDto.candidateId)) {
            throw new common_1.BadRequestException('Invalid candidate ID');
        }
        const referral = new this.referralModel({
            referringEmployeeId: new mongoose_2.Types.ObjectId(createDto.referringEmployeeId),
            candidateId: new mongoose_2.Types.ObjectId(createDto.candidateId),
            role: createDto.role,
            level: createDto.level,
        });
        return await referral.save();
    }
    async findAllReferrals(filters) {
        const query = this.referralModel
            .find()
            .populate('referringEmployeeId')
            .populate('candidateId');
        if (filters?.referringEmployeeId) {
            query.where('referringEmployeeId').equals(filters.referringEmployeeId);
        }
        if (filters?.candidateId) {
            query.where('candidateId').equals(filters.candidateId);
        }
        if (filters?.role) {
            query.where('role').equals(filters.role);
        }
        return await query.exec();
    }
    async findReferralById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid referral ID');
        }
        const referral = await this.referralModel
            .findById(id)
            .populate('referringEmployeeId')
            .populate('candidateId')
            .exec();
        if (!referral) {
            throw new common_1.NotFoundException(`Referral with ID ${id} not found`);
        }
        return referral;
    }
    async updateReferral(id, updateDto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid referral ID');
        }
        const updateData = {};
        if (updateDto.referringEmployeeId) {
            if (!mongoose_2.Types.ObjectId.isValid(updateDto.referringEmployeeId)) {
                throw new common_1.BadRequestException('Invalid referring employee ID');
            }
            updateData.referringEmployeeId = new mongoose_2.Types.ObjectId(updateDto.referringEmployeeId);
        }
        if (updateDto.candidateId) {
            if (!mongoose_2.Types.ObjectId.isValid(updateDto.candidateId)) {
                throw new common_1.BadRequestException('Invalid candidate ID');
            }
            updateData.candidateId = new mongoose_2.Types.ObjectId(updateDto.candidateId);
        }
        if (updateDto.role) {
            updateData.role = updateDto.role;
        }
        if (updateDto.level) {
            updateData.level = updateDto.level;
        }
        const referral = await this.referralModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .populate('referringEmployeeId')
            .populate('candidateId')
            .exec();
        if (!referral) {
            throw new common_1.NotFoundException(`Referral with ID ${id} not found`);
        }
        return referral;
    }
    async deleteReferral(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid referral ID');
        }
        const referral = await this.referralModel.findByIdAndDelete(id).exec();
        if (!referral) {
            throw new common_1.NotFoundException(`Referral with ID ${id} not found`);
        }
    }
    async createDocument(createDto) {
        const document = new this.documentModel({
            ownerId: createDto.ownerId
                ? new mongoose_2.Types.ObjectId(createDto.ownerId)
                : undefined,
            type: createDto.type,
            filePath: createDto.filePath,
            uploadedAt: new Date(),
        });
        return await document.save();
    }
    async findAllDocuments(filters) {
        const query = this.documentModel.find().populate('ownerId');
        if (filters?.entityType) {
            query.where('entityType').equals(filters.entityType);
        }
        if (filters?.entityId) {
            if (mongoose_2.Types.ObjectId.isValid(filters.entityId)) {
                query.where('entityId').equals(new mongoose_2.Types.ObjectId(filters.entityId));
            }
        }
        if (filters?.documentType) {
            query.where('type').equals(filters.documentType);
        }
        if (filters?.ownerId) {
            if (mongoose_2.Types.ObjectId.isValid(filters.ownerId)) {
                query.where('ownerId').equals(new mongoose_2.Types.ObjectId(filters.ownerId));
            }
        }
        return await query.exec();
    }
    async findDocumentById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid document ID');
        }
        const document = await this.documentModel
            .findById(id)
            .populate('ownerId')
            .exec();
        if (!document) {
            throw new common_1.NotFoundException(`Document with ID ${id} not found`);
        }
        return document;
    }
    async updateDocument(id, updateDto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid document ID');
        }
        const updateData = {};
        if (updateDto.type) {
            updateData.type = updateDto.type;
        }
        if (updateDto.ownerId) {
            if (!mongoose_2.Types.ObjectId.isValid(updateDto.ownerId)) {
                throw new common_1.BadRequestException('Invalid owner ID');
            }
            updateData.ownerId = new mongoose_2.Types.ObjectId(updateDto.ownerId);
        }
        const document = await this.documentModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .populate('ownerId')
            .exec();
        if (!document) {
            throw new common_1.NotFoundException(`Document with ID ${id} not found`);
        }
        return document;
    }
    async deleteDocument(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid document ID');
        }
        const document = await this.documentModel.findByIdAndDelete(id).exec();
        if (!document) {
            throw new common_1.NotFoundException(`Document with ID ${id} not found`);
        }
    }
    async downloadDocument(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid document ID');
        }
        const document = await this.findDocumentById(id);
        return {
            documentId: id,
            filePath: document.filePath,
            downloadUrl: `/documents/${id}/download`,
            message: 'File download not yet implemented',
        };
    }
    async getRecruitmentOverview(filters) {
        const totalRequisitions = await this.jobRequisitionModel.countDocuments().exec();
        const openRequisitions = await this.jobRequisitionModel
            .countDocuments({ publishStatus: 'published' })
            .exec();
        const totalApplications = await this.applicationModel.countDocuments().exec();
        const activeApplications = await this.applicationModel
            .countDocuments({ status: application_status_enum_1.ApplicationStatus.IN_PROCESS })
            .exec();
        const totalOffers = await this.offerModel.countDocuments().exec();
        const pendingOffers = await this.offerModel
            .countDocuments({ applicantResponse: offer_response_status_enum_1.OfferResponseStatus.PENDING })
            .exec();
        return {
            requisitions: {
                total: totalRequisitions,
                open: openRequisitions,
                closed: totalRequisitions - openRequisitions,
            },
            applications: {
                total: totalApplications,
                active: activeApplications,
                hired: await this.applicationModel
                    .countDocuments({ status: application_status_enum_1.ApplicationStatus.HIRED })
                    .exec(),
                rejected: await this.applicationModel
                    .countDocuments({ status: application_status_enum_1.ApplicationStatus.REJECTED })
                    .exec(),
            },
            offers: {
                total: totalOffers,
                pending: pendingOffers,
                accepted: await this.offerModel
                    .countDocuments({ applicantResponse: offer_response_status_enum_1.OfferResponseStatus.ACCEPTED })
                    .exec(),
                rejected: await this.offerModel
                    .countDocuments({ applicantResponse: offer_response_status_enum_1.OfferResponseStatus.REJECTED })
                    .exec(),
            },
        };
    }
    async getRecruitmentMetrics(filters) {
        const overview = await this.getRecruitmentOverview(filters);
        const interviews = await this.interviewModel.countDocuments().exec();
        const completedInterviews = await this.interviewModel
            .countDocuments({ status: interview_status_enum_1.InterviewStatus.COMPLETED })
            .exec();
        return {
            ...overview,
            interviews: {
                total: interviews,
                completed: completedInterviews,
                scheduled: await this.interviewModel
                    .countDocuments({ status: interview_status_enum_1.InterviewStatus.SCHEDULED })
                    .exec(),
                cancelled: await this.interviewModel
                    .countDocuments({ status: interview_status_enum_1.InterviewStatus.CANCELLED })
                    .exec(),
            },
            timeToHire: await this.getTimeToHireMetrics(),
        };
    }
    async getPipelineView(filters) {
        const query = {};
        if (filters?.requisitionId) {
            query.requisitionId = new mongoose_2.Types.ObjectId(filters.requisitionId);
        }
        const pipeline = {
            screening: await this.applicationModel
                .countDocuments({ ...query, currentStage: application_stage_enum_1.ApplicationStage.SCREENING })
                .exec(),
            departmentInterview: await this.applicationModel
                .countDocuments({
                ...query,
                currentStage: application_stage_enum_1.ApplicationStage.DEPARTMENT_INTERVIEW,
            })
                .exec(),
            hrInterview: await this.applicationModel
                .countDocuments({
                ...query,
                currentStage: application_stage_enum_1.ApplicationStage.HR_INTERVIEW,
            })
                .exec(),
            offer: await this.applicationModel
                .countDocuments({ ...query, currentStage: application_stage_enum_1.ApplicationStage.OFFER })
                .exec(),
        };
        return pipeline;
    }
    async getRequisitionMetrics(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid requisition ID');
        }
        const requisition = await this.findJobRequisitionById(id);
        const totalApplications = await this.applicationModel
            .countDocuments({ requisitionId: new mongoose_2.Types.ObjectId(id) })
            .exec();
        const applicationsByStage = await this.getApplicationsByStage(id);
        const applicationsByStatus = await this.getApplicationsByStatus(id);
        return {
            requisitionId: requisition.requisitionId,
            openings: requisition.openings,
            totalApplications,
            applicationsByStage,
            applicationsByStatus,
            timeToHire: await this.getTimeToHireMetrics(id),
        };
    }
    async getApplicationsByStage(requisitionId) {
        const query = {};
        if (requisitionId) {
            if (!mongoose_2.Types.ObjectId.isValid(requisitionId)) {
                throw new common_1.BadRequestException('Invalid requisition ID');
            }
            query.requisitionId = new mongoose_2.Types.ObjectId(requisitionId);
        }
        return {
            screening: await this.applicationModel
                .countDocuments({ ...query, currentStage: application_stage_enum_1.ApplicationStage.SCREENING })
                .exec(),
            departmentInterview: await this.applicationModel
                .countDocuments({
                ...query,
                currentStage: application_stage_enum_1.ApplicationStage.DEPARTMENT_INTERVIEW,
            })
                .exec(),
            hrInterview: await this.applicationModel
                .countDocuments({
                ...query,
                currentStage: application_stage_enum_1.ApplicationStage.HR_INTERVIEW,
            })
                .exec(),
            offer: await this.applicationModel
                .countDocuments({ ...query, currentStage: application_stage_enum_1.ApplicationStage.OFFER })
                .exec(),
        };
    }
    async getApplicationsByStatus(requisitionId) {
        const query = {};
        if (requisitionId) {
            if (!mongoose_2.Types.ObjectId.isValid(requisitionId)) {
                throw new common_1.BadRequestException('Invalid requisition ID');
            }
            query.requisitionId = new mongoose_2.Types.ObjectId(requisitionId);
        }
        return {
            submitted: await this.applicationModel
                .countDocuments({ ...query, status: application_status_enum_1.ApplicationStatus.SUBMITTED })
                .exec(),
            inProcess: await this.applicationModel
                .countDocuments({ ...query, status: application_status_enum_1.ApplicationStatus.IN_PROCESS })
                .exec(),
            offer: await this.applicationModel
                .countDocuments({ ...query, status: application_status_enum_1.ApplicationStatus.OFFER })
                .exec(),
            hired: await this.applicationModel
                .countDocuments({ ...query, status: application_status_enum_1.ApplicationStatus.HIRED })
                .exec(),
            rejected: await this.applicationModel
                .countDocuments({ ...query, status: application_status_enum_1.ApplicationStatus.REJECTED })
                .exec(),
        };
    }
    async getTimeToHireMetrics(requisitionId) {
        const query = { status: application_status_enum_1.ApplicationStatus.HIRED };
        if (requisitionId) {
            if (!mongoose_2.Types.ObjectId.isValid(requisitionId)) {
                throw new common_1.BadRequestException('Invalid requisition ID');
            }
            query.requisitionId = new mongoose_2.Types.ObjectId(requisitionId);
        }
        const hiredApplications = await this.applicationModel
            .find(query)
            .exec();
        if (hiredApplications.length === 0) {
            return {
                average: 0,
                min: 0,
                max: 0,
                count: 0,
            };
        }
        const timesToHire = hiredApplications.map((app) => {
            const createdAt = app.createdAt?.getTime() || Date.now();
            const updatedAt = app.updatedAt?.getTime() || Date.now();
            return Math.floor((updatedAt - createdAt) / (1000 * 60 * 60 * 24));
        });
        return {
            average: Math.round(timesToHire.reduce((a, b) => a + b, 0) / timesToHire.length),
            min: Math.min(...timesToHire),
            max: Math.max(...timesToHire),
            count: timesToHire.length,
        };
    }
    async createApplicationHistoryEntry(applicationId, oldStage, newStage, oldStatus, newStatus, changedBy) {
        await this.applicationHistoryModel.create({
            applicationId: new mongoose_2.Types.ObjectId(applicationId),
            oldStage: oldStage || '',
            newStage,
            oldStatus: oldStatus || '',
            newStatus,
            changedBy: new mongoose_2.Types.ObjectId(changedBy),
        });
    }
};
exports.RecruitmentService = RecruitmentService;
exports.RecruitmentService = RecruitmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(job_template_schema_1.JobTemplate.name)),
    __param(1, (0, mongoose_1.InjectModel)(job_requisition_schema_1.JobRequisition.name)),
    __param(2, (0, mongoose_1.InjectModel)(application_schema_1.Application.name)),
    __param(3, (0, mongoose_1.InjectModel)(application_history_schema_1.ApplicationStatusHistory.name)),
    __param(4, (0, mongoose_1.InjectModel)(interview_schema_1.Interview.name)),
    __param(5, (0, mongoose_1.InjectModel)(assessment_result_schema_1.AssessmentResult.name)),
    __param(6, (0, mongoose_1.InjectModel)(offer_schema_1.Offer.name)),
    __param(7, (0, mongoose_1.InjectModel)(contract_schema_1.Contract.name)),
    __param(8, (0, mongoose_1.InjectModel)(onboarding_schema_1.Onboarding.name)),
    __param(9, (0, mongoose_1.InjectModel)(termination_request_schema_1.TerminationRequest.name)),
    __param(10, (0, mongoose_1.InjectModel)(clearance_checklist_schema_1.ClearanceChecklist.name)),
    __param(11, (0, mongoose_1.InjectModel)(referral_schema_1.Referral.name)),
    __param(12, (0, mongoose_1.InjectModel)(document_schema_1.Document.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        employee_profile_service_1.EmployeeProfileService])
], RecruitmentService);
//# sourceMappingURL=recruitment.service.js.map