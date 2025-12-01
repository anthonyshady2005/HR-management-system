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
exports.RecruitmentController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const recruitment_service_1 = require("./recruitment.service");
const dto_1 = require("./dto");
let RecruitmentController = class RecruitmentController {
    recruitmentService;
    constructor(recruitmentService) {
        this.recruitmentService = recruitmentService;
    }
    async createJobTemplate(createDto) {
        return this.recruitmentService.createJobTemplate(createDto);
    }
    async getJobTemplates(filters) {
        return this.recruitmentService.findAllJobTemplates(filters);
    }
    async getJobTemplateById(id) {
        return this.recruitmentService.findJobTemplateById(id);
    }
    async updateJobTemplate(id, updateDto) {
        return this.recruitmentService.updateJobTemplate(id, updateDto);
    }
    async deleteJobTemplate(id) {
        return this.recruitmentService.deleteJobTemplate(id);
    }
    async createJobRequisition(createDto) {
        return this.recruitmentService.createJobRequisition(createDto);
    }
    async getJobRequisitions(filters) {
        return this.recruitmentService.findAllJobRequisitions(filters);
    }
    async getJobRequisitionById(id) {
        return this.recruitmentService.findJobRequisitionById(id);
    }
    async updateJobRequisition(id, updateDto) {
        return this.recruitmentService.updateJobRequisition(id, updateDto);
    }
    async publishJobRequisition(id) {
        return this.recruitmentService.publishJobRequisition(id);
    }
    async closeJobRequisition(id) {
        return this.recruitmentService.closeJobRequisition(id);
    }
    async previewJobRequisition(id) {
        return this.recruitmentService.previewJobRequisition(id);
    }
    async deleteJobRequisition(id) {
        return this.recruitmentService.deleteJobRequisition(id);
    }
    async createApplication(createDto) {
        return this.recruitmentService.createApplication(createDto);
    }
    async getApplications(filters) {
        return this.recruitmentService.findAllApplications(filters);
    }
    async getApplicationById(id) {
        return this.recruitmentService.findApplicationById(id);
    }
    async updateApplicationStage(id, updateDto) {
        return this.recruitmentService.updateApplicationStage(id, updateDto);
    }
    async updateApplicationStatus(id, updateDto) {
        return this.recruitmentService.updateApplicationStatus(id, updateDto);
    }
    async assignHrToApplication(id, assignDto) {
        if (!assignDto.assignedHr) {
            throw new common_1.BadRequestException('HR employee ID is required');
        }
        return this.recruitmentService.assignHrToApplication(id, assignDto.assignedHr);
    }
    async getApplicationHistory(id) {
        return this.recruitmentService.getApplicationHistory(id);
    }
    async getApplicationCommunicationLogs(id) {
        return this.recruitmentService.getApplicationCommunicationLogs(id);
    }
    async recordConsent(id, consentDto) {
        return this.recruitmentService.recordConsent(id, consentDto);
    }
    async getConsentStatus(id) {
        return this.recruitmentService.getConsentStatus(id);
    }
    async createInterview(createDto) {
        return this.recruitmentService.createInterview(createDto);
    }
    async getInterviews(filters) {
        return this.recruitmentService.findAllInterviews(filters);
    }
    async getInterviewById(id) {
        return this.recruitmentService.findInterviewById(id);
    }
    async updateInterview(id, updateDto) {
        return this.recruitmentService.updateInterview(id, updateDto);
    }
    async updateInterviewStatus(id, statusDto) {
        if (!statusDto.status) {
            throw new common_1.BadRequestException('Interview status is required');
        }
        return this.recruitmentService.updateInterviewStatus(id, statusDto.status);
    }
    async submitAssessment(id, assessmentDto) {
        return this.recruitmentService.createAssessmentResult(assessmentDto);
    }
    async getInterviewAssessment(id) {
        return this.recruitmentService.getInterviewAssessment(id);
    }
    async sendCalendarInvite(id) {
        return this.recruitmentService.sendCalendarInvite(id);
    }
    async createOffer(createDto) {
        return this.recruitmentService.createOffer(createDto);
    }
    async getOffers(filters) {
        return this.recruitmentService.findAllOffers(filters);
    }
    async getOfferById(id) {
        return this.recruitmentService.findOfferById(id);
    }
    async updateOffer(id, updateDto) {
        return this.recruitmentService.updateOffer(id, updateDto);
    }
    async updateOfferResponse(id, responseDto) {
        return this.recruitmentService.updateOfferResponse(id, responseDto.applicantResponse);
    }
    async updateOfferApproval(id, approvalDto) {
        return this.recruitmentService.updateOfferApproval(id, approvalDto.approverId, approvalDto.status);
    }
    async signOffer(id, signDto) {
        return this.recruitmentService.signOffer(id, signDto.signerType, signDto.signature);
    }
    async generateOfferPDF(id) {
        return this.recruitmentService.generateOfferPDF(id);
    }
    async sendOfferToCandidate(id) {
        return this.recruitmentService.sendOfferToCandidate(id);
    }
    async createContract(createDto) {
        return this.recruitmentService.createContract(createDto);
    }
    async getContracts(filters) {
        return this.recruitmentService.findAllContracts(filters);
    }
    async getContractById(id) {
        return this.recruitmentService.findContractById(id);
    }
    async signContract(id, signDto) {
        return this.recruitmentService.signContract(id, signDto.signerType, signDto.signatureUrl);
    }
    async getContractPDF(id) {
        return this.recruitmentService.generateContractPDF(id);
    }
    async getContractByOfferId(offerId) {
        return this.recruitmentService.getContractByOfferId(offerId);
    }
    async createOnboarding(createDto) {
        return this.recruitmentService.createOnboarding(createDto);
    }
    async getOnboardingByEmployeeId(employeeId) {
        return this.recruitmentService.findOnboardingByEmployeeId(employeeId);
    }
    async updateOnboardingTask(id, taskId, updateDto) {
        return this.recruitmentService.updateOnboardingTask(id, taskId, updateDto);
    }
    async completeOnboarding(id) {
        return this.recruitmentService.completeOnboarding(id);
    }
    async getOnboardingTasks(id) {
        return this.recruitmentService.getOnboardingTasks(id);
    }
    async createTerminationRequest(createDto) {
        return this.recruitmentService.createTerminationRequest(createDto);
    }
    async getTerminationRequests(filters) {
        return this.recruitmentService.findAllTerminationRequests(filters);
    }
    async getTerminationRequestById(id) {
        return this.recruitmentService.findTerminationRequestById(id);
    }
    async updateTerminationStatus(id, statusDto) {
        return this.recruitmentService.updateTerminationStatus(id, statusDto.status);
    }
    async getClearanceChecklist(id) {
        return this.recruitmentService.getClearanceChecklist(id);
    }
    async updateClearanceChecklist(id, updateDto) {
        return this.recruitmentService.updateClearanceChecklist(id, updateDto);
    }
    async createReferral(createDto) {
        return this.recruitmentService.createReferral(createDto);
    }
    async getReferrals(filters) {
        return this.recruitmentService.findAllReferrals(filters);
    }
    async getReferralById(id) {
        return this.recruitmentService.findReferralById(id);
    }
    async updateReferral(id, updateDto) {
        return this.recruitmentService.updateReferral(id, updateDto);
    }
    async deleteReferral(id) {
        return this.recruitmentService.deleteReferral(id);
    }
    async uploadDocument(file, documentDto) {
        return this.recruitmentService.createDocument({
            ...documentDto,
            filePath: file.path,
            fileName: file.originalname,
            fileSize: file.size,
        });
    }
    async getDocuments(filters) {
        return this.recruitmentService.findAllDocuments(filters);
    }
    async getDocumentById(id) {
        return this.recruitmentService.findDocumentById(id);
    }
    async updateDocument(id, updateDto) {
        return this.recruitmentService.updateDocument(id, updateDto);
    }
    async deleteDocument(id) {
        return this.recruitmentService.deleteDocument(id);
    }
    async downloadDocument(id) {
        return this.recruitmentService.downloadDocument(id);
    }
    async getRecruitmentOverview(filters) {
        return this.recruitmentService.getRecruitmentOverview(filters);
    }
    async getRecruitmentMetrics(filters) {
        return this.recruitmentService.getRecruitmentMetrics(filters);
    }
    async getPipelineView(filters) {
        return this.recruitmentService.getPipelineView(filters);
    }
    async getRequisitionMetrics(id) {
        return this.recruitmentService.getRequisitionMetrics(id);
    }
    async getApplicationsByStage(filters) {
        return this.recruitmentService.getApplicationsByStage(filters.requisitionId);
    }
    async getApplicationsByStatus(filters) {
        return this.recruitmentService.getApplicationsByStatus(filters.requisitionId);
    }
    async getTimeToHireMetrics(filters) {
        return this.recruitmentService.getTimeToHireMetrics(filters.requisitionId);
    }
};
exports.RecruitmentController = RecruitmentController;
__decorate([
    (0, common_1.Post)('job-templates'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new job template', description: 'Creates a standardized job description template for consistent job postings' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateJobTemplateDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Job template created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateJobTemplateDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "createJobTemplate", null);
__decorate([
    (0, common_1.Get)('job-templates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all job templates', description: 'Retrieves all job templates with optional filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'department', required: false, description: 'Filter by department' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of job templates retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getJobTemplates", null);
__decorate([
    (0, common_1.Get)('job-templates/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get job template by ID', description: 'Retrieves a specific job template by its ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Job template ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Job template retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Job template not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getJobTemplateById", null);
__decorate([
    (0, common_1.Patch)('job-templates/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update job template', description: 'Updates an existing job template' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Job template ID' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateJobTemplateDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Job template updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Job template not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateJobTemplateDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "updateJobTemplate", null);
__decorate([
    (0, common_1.Delete)('job-templates/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete job template', description: 'Deletes a job template by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Job template ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Job template deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Job template not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "deleteJobTemplate", null);
__decorate([
    (0, common_1.Post)('job-requisitions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new job requisition', description: 'Creates a job requisition from a job template' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateJobRequisitionDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Job requisition created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateJobRequisitionDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "createJobRequisition", null);
__decorate([
    (0, common_1.Get)('job-requisitions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all job requisitions', description: 'Retrieves all job requisitions with optional filtering by status, department, etc.' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filter by publish status (draft, published, closed)' }),
    (0, swagger_1.ApiQuery)({ name: 'department', required: false, description: 'Filter by department' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of job requisitions retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getJobRequisitions", null);
__decorate([
    (0, common_1.Get)('job-requisitions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get job requisition by ID', description: 'Retrieves a specific job requisition by its ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Job requisition ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Job requisition retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Job requisition not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getJobRequisitionById", null);
__decorate([
    (0, common_1.Patch)('job-requisitions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update job requisition', description: 'Updates an existing job requisition' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Job requisition ID' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateJobRequisitionDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Job requisition updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Job requisition not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateJobRequisitionDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "updateJobRequisition", null);
__decorate([
    (0, common_1.Patch)('job-requisitions/:id/publish'),
    (0, swagger_1.ApiOperation)({ summary: 'Publish job requisition', description: 'Publishes a job requisition to make it visible on careers page' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Job requisition ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Job requisition published successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Job requisition not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "publishJobRequisition", null);
__decorate([
    (0, common_1.Patch)('job-requisitions/:id/close'),
    (0, swagger_1.ApiOperation)({ summary: 'Close job requisition', description: 'Closes a job requisition (no longer accepting applications)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Job requisition ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Job requisition closed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Job requisition not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "closeJobRequisition", null);
__decorate([
    (0, common_1.Get)('job-requisitions/:id/preview'),
    (0, swagger_1.ApiOperation)({ summary: 'Preview job requisition', description: 'Gets a preview of how the job requisition will appear when published' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Job requisition ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Job requisition preview retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Job requisition not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "previewJobRequisition", null);
__decorate([
    (0, common_1.Delete)('job-requisitions/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete job requisition', description: 'Deletes a job requisition by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Job requisition ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Job requisition deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Job requisition not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "deleteJobRequisition", null);
__decorate([
    (0, common_1.Post)('applications'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Submit new application', description: 'Creates a new job application for a candidate' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateApplicationDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Application submitted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateApplicationDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "createApplication", null);
__decorate([
    (0, common_1.Get)('applications'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all applications', description: 'Retrieves all applications with optional filtering by status, stage, requisitionId, candidateId' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filter by application status' }),
    (0, swagger_1.ApiQuery)({ name: 'stage', required: false, description: 'Filter by application stage' }),
    (0, swagger_1.ApiQuery)({ name: 'requisitionId', required: false, description: 'Filter by job requisition ID' }),
    (0, swagger_1.ApiQuery)({ name: 'candidateId', required: false, description: 'Filter by candidate ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of applications retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getApplications", null);
__decorate([
    (0, common_1.Get)('applications/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get application by ID', description: 'Retrieves a specific application by its ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Application ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Application retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Application not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getApplicationById", null);
__decorate([
    (0, common_1.Patch)('applications/:id/stage'),
    (0, swagger_1.ApiOperation)({ summary: 'Update application stage', description: 'Updates the current stage of an application (screening, department_interview, hr_interview, offer)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Application ID' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateApplicationStageDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Application stage updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Application not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateApplicationStageDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "updateApplicationStage", null);
__decorate([
    (0, common_1.Patch)('applications/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update application status', description: 'Updates the status of an application (submitted, in_process, offer, hired, rejected)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Application ID' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateApplicationStatusDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Application status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Application not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateApplicationStatusDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "updateApplicationStatus", null);
__decorate([
    (0, common_1.Patch)('applications/:id/assign-hr'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign HR to application', description: 'Assigns or reassigns an HR representative to an application' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Application ID' }),
    (0, swagger_1.ApiBody)({ type: dto_1.AssignHrDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'HR assigned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Application not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - HR employee ID is required' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AssignHrDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "assignHrToApplication", null);
__decorate([
    (0, common_1.Get)('applications/:id/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get application status history', description: 'Retrieves the complete status and stage change history for an application' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Application ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Application history retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Application not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getApplicationHistory", null);
__decorate([
    (0, common_1.Get)('applications/:id/communication-logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get application communication logs', description: 'Retrieves all communication logs for an application' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Application ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Communication logs retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Application not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getApplicationCommunicationLogs", null);
__decorate([
    (0, common_1.Post)('applications/:id/consent'),
    (0, swagger_1.ApiOperation)({ summary: 'Record consent for application', description: 'Records candidate consent for personal data processing (GDPR compliance)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Application ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Consent recorded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Application not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "recordConsent", null);
__decorate([
    (0, common_1.Get)('applications/:id/consent'),
    (0, swagger_1.ApiOperation)({ summary: 'Get consent status', description: 'Retrieves the consent status for an application' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Application ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Consent status retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Application not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getConsentStatus", null);
__decorate([
    (0, common_1.Post)('interviews'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Schedule new interview', description: 'Schedules a new interview for an application with panel members, date, and method' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateInterviewDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Interview scheduled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateInterviewDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "createInterview", null);
__decorate([
    (0, common_1.Get)('interviews'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all interviews', description: 'Retrieves all interviews with optional filtering by applicationId, status, date range' }),
    (0, swagger_1.ApiQuery)({ name: 'applicationId', required: false, description: 'Filter by application ID' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filter by interview status' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Filter by start date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'Filter by end date (ISO string)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of interviews retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getInterviews", null);
__decorate([
    (0, common_1.Get)('interviews/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get interview by ID', description: 'Retrieves a specific interview by its ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Interview ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Interview retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Interview not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getInterviewById", null);
__decorate([
    (0, common_1.Patch)('interviews/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update interview details', description: 'Updates interview details such as date, method, panel members, video link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Interview ID' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateInterviewDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Interview updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Interview not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateInterviewDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "updateInterview", null);
__decorate([
    (0, common_1.Patch)('interviews/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update interview status', description: 'Updates the status of an interview (scheduled, completed, cancelled)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Interview ID' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateInterviewDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Interview status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Interview not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - interview status is required' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateInterviewDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "updateInterviewStatus", null);
__decorate([
    (0, common_1.Post)('interviews/:id/assessment'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit interview assessment', description: 'Submits interview feedback and scores from an interviewer' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Interview ID' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateAssessmentResultDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Assessment submitted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Interview not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateAssessmentResultDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "submitAssessment", null);
__decorate([
    (0, common_1.Get)('interviews/:id/assessment'),
    (0, swagger_1.ApiOperation)({ summary: 'Get interview assessment', description: 'Retrieves all assessment results for an interview' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Interview ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Assessment results retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Interview not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getInterviewAssessment", null);
__decorate([
    (0, common_1.Post)('interviews/:id/send-calendar-invite'),
    (0, swagger_1.ApiOperation)({ summary: 'Send calendar invite', description: 'Sends calendar invites to interviewers and candidate for the scheduled interview' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Interview ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Calendar invites sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Interview not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "sendCalendarInvite", null);
__decorate([
    (0, common_1.Post)('offers'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create job offer', description: 'Creates a job offer with compensation details, benefits, and approval workflow' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateOfferDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Offer created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateOfferDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "createOffer", null);
__decorate([
    (0, common_1.Get)('offers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all offers', description: 'Retrieves all offers with optional filtering by applicationId, candidateId, status' }),
    (0, swagger_1.ApiQuery)({ name: 'applicationId', required: false, description: 'Filter by application ID' }),
    (0, swagger_1.ApiQuery)({ name: 'candidateId', required: false, description: 'Filter by candidate ID' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filter by offer status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of offers retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getOffers", null);
__decorate([
    (0, common_1.Get)('offers/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get offer by ID', description: 'Retrieves a specific offer by its ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Offer ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Offer retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Offer not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getOfferById", null);
__decorate([
    (0, common_1.Patch)('offers/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update offer details', description: 'Updates offer details such as compensation, benefits, content, deadline' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Offer ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Offer updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Offer not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "updateOffer", null);
__decorate([
    (0, common_1.Patch)('offers/:id/response'),
    (0, swagger_1.ApiOperation)({ summary: 'Update candidate response', description: 'Updates the candidate response to an offer (accepted, rejected, pending)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Offer ID' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateOfferStatusDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Offer response updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Offer not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateOfferStatusDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "updateOfferResponse", null);
__decorate([
    (0, common_1.Patch)('offers/:id/approval'),
    (0, swagger_1.ApiOperation)({ summary: 'Update approval workflow status', description: 'Updates the approval workflow status for an offer (individual approver status)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Offer ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Approval status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Offer not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "updateOfferApproval", null);
__decorate([
    (0, common_1.Post)('offers/:id/sign'),
    (0, swagger_1.ApiOperation)({ summary: 'Sign offer', description: 'Signs an offer letter (candidate, HR, or manager signature)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Offer ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Offer signed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Offer not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "signOffer", null);
__decorate([
    (0, common_1.Post)('offers/:id/generate-pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate offer PDF', description: 'Generates a PDF document for the offer letter' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Offer ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Offer PDF generated successfully', content: { 'application/pdf': {} } }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Offer not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "generateOfferPDF", null);
__decorate([
    (0, common_1.Post)('offers/:id/send'),
    (0, swagger_1.ApiOperation)({ summary: 'Send offer to candidate', description: 'Sends the offer letter to the candidate via email' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Offer ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Offer sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Offer not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "sendOfferToCandidate", null);
__decorate([
    (0, common_1.Post)('contracts'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create contract from accepted offer', description: 'Creates an employment contract from an accepted offer' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateContractDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Contract created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateContractDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "createContract", null);
__decorate([
    (0, common_1.Get)('contracts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all contracts', description: 'Retrieves all employment contracts' }),
    (0, swagger_1.ApiQuery)({ name: 'offerId', required: false, description: 'Filter by offer ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of contracts retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getContracts", null);
__decorate([
    (0, common_1.Get)('contracts/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get contract by ID', description: 'Retrieves a specific contract by its ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Contract ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contract retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contract not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getContractById", null);
__decorate([
    (0, common_1.Patch)('contracts/:id/sign'),
    (0, swagger_1.ApiOperation)({ summary: 'Sign contract', description: 'Signs a contract (employee or employer signature)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Contract ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contract signed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contract not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "signContract", null);
__decorate([
    (0, common_1.Get)('contracts/:id/pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Get contract PDF', description: 'Retrieves the contract as a PDF document' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Contract ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contract PDF retrieved successfully', content: { 'application/pdf': {} } }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contract not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getContractPDF", null);
__decorate([
    (0, common_1.Get)('contracts/offer/:offerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get contract by offer ID', description: 'Retrieves a contract associated with a specific offer' }),
    (0, swagger_1.ApiParam)({ name: 'offerId', description: 'Offer ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contract retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contract not found' }),
    __param(0, (0, common_1.Param)('offerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getContractByOfferId", null);
__decorate([
    (0, common_1.Post)('onboarding'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Initialize onboarding process', description: 'Creates an onboarding checklist and tasks for a new employee' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateOnboardingDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Onboarding process initialized successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateOnboardingDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "createOnboarding", null);
__decorate([
    (0, common_1.Get)('onboarding/:employeeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get onboarding by employee ID', description: 'Retrieves onboarding information for a specific employee' }),
    (0, swagger_1.ApiParam)({ name: 'employeeId', description: 'Employee ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Onboarding information retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Onboarding not found' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getOnboardingByEmployeeId", null);
__decorate([
    (0, common_1.Patch)('onboarding/:id/tasks/:taskId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update onboarding task status', description: 'Updates the status of a specific onboarding task' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Onboarding ID' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', description: 'Task ID' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateOnboardingTaskDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Onboarding task updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Onboarding or task not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateOnboardingTaskDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "updateOnboardingTask", null);
__decorate([
    (0, common_1.Patch)('onboarding/:id/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark onboarding as complete', description: 'Marks the entire onboarding process as completed' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Onboarding ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Onboarding marked as complete' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Onboarding not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "completeOnboarding", null);
__decorate([
    (0, common_1.Get)('onboarding/:id/tasks'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all onboarding tasks', description: 'Retrieves all tasks for an onboarding process' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Onboarding ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Onboarding tasks retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Onboarding not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getOnboardingTasks", null);
__decorate([
    (0, common_1.Post)('terminations'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create termination request', description: 'Creates a termination request for an employee (resignation or termination)' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateTerminationRequestDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Termination request created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateTerminationRequestDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "createTerminationRequest", null);
__decorate([
    (0, common_1.Get)('terminations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all termination requests', description: 'Retrieves all termination requests with optional filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filter by termination status' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, description: 'Filter by termination type (resignation, termination)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of termination requests retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getTerminationRequests", null);
__decorate([
    (0, common_1.Get)('terminations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get termination request by ID', description: 'Retrieves a specific termination request by its ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Termination request ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Termination request retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Termination request not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getTerminationRequestById", null);
__decorate([
    (0, common_1.Patch)('terminations/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update termination status', description: 'Updates the status of a termination request' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Termination request ID' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateTerminationStatusDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Termination status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Termination request not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateTerminationStatusDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "updateTerminationStatus", null);
__decorate([
    (0, common_1.Get)('terminations/:id/clearance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get clearance checklist', description: 'Retrieves the clearance checklist for a termination request' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Termination request ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Clearance checklist retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Termination request not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getClearanceChecklist", null);
__decorate([
    (0, common_1.Patch)('terminations/:id/clearance'),
    (0, swagger_1.ApiOperation)({ summary: 'Update clearance checklist', description: 'Updates the clearance checklist items for a termination request' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Termination request ID' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateClearanceChecklistDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Clearance checklist updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Termination request not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateClearanceChecklistDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "updateClearanceChecklist", null);
__decorate([
    (0, common_1.Post)('referrals'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create employee referral', description: 'Creates a referral record when an employee refers a candidate' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateReferralDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Referral created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateReferralDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "createReferral", null);
__decorate([
    (0, common_1.Get)('referrals'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all referrals', description: 'Retrieves all employee referrals with optional filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'referrerId', required: false, description: 'Filter by referrer employee ID' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filter by referral status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of referrals retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getReferrals", null);
__decorate([
    (0, common_1.Get)('referrals/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get referral by ID', description: 'Retrieves a specific referral by its ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Referral ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Referral retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Referral not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getReferralById", null);
__decorate([
    (0, common_1.Patch)('referrals/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update referral', description: 'Updates an existing referral' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Referral ID' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateReferralDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Referral updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Referral not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "updateReferral", null);
__decorate([
    (0, common_1.Delete)('referrals/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete referral', description: 'Deletes a referral by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Referral ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Referral deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Referral not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "deleteReferral", null);
__decorate([
    (0, common_1.Post)('documents'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Upload document', description: 'Uploads a document (resume, certificate, etc.) with metadata' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Document file (PDF, DOC, DOCX, JPG, JPEG, PNG, max 10MB)',
                },
                entityType: { type: 'string', description: 'Entity type (application, candidate, offer, etc.)' },
                entityId: { type: 'string', description: 'Entity ID' },
                documentType: { type: 'string', description: 'Document type' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Document uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error or invalid file' }),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /(pdf|doc|docx|jpg|jpeg|png)$/ }),
        ],
    }))),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateDocumentDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Get)('documents'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all documents', description: 'Retrieves all documents with optional filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'entityType', required: false, description: 'Filter by entity type (application, candidate, offer, etc.)' }),
    (0, swagger_1.ApiQuery)({ name: 'entityId', required: false, description: 'Filter by entity ID' }),
    (0, swagger_1.ApiQuery)({ name: 'documentType', required: false, description: 'Filter by document type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of documents retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Get)('documents/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get document by ID', description: 'Retrieves document metadata by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Document ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Document not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getDocumentById", null);
__decorate([
    (0, common_1.Patch)('documents/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update document', description: 'Updates document metadata' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Document ID' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateDocumentDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Document not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateDocumentDto]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "updateDocument", null);
__decorate([
    (0, common_1.Delete)('documents/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete document', description: 'Deletes a document by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Document ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Document deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Document not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "deleteDocument", null);
__decorate([
    (0, common_1.Get)('documents/:id/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Download document', description: 'Downloads a document file' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Document ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document file downloaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Document not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "downloadDocument", null);
__decorate([
    (0, common_1.Get)('dashboard/overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recruitment overview', description: 'Retrieves high-level recruitment statistics and overview data' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Filter by start date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'Filter by end date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'department', required: false, description: 'Filter by department' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recruitment overview retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getRecruitmentOverview", null);
__decorate([
    (0, common_1.Get)('dashboard/metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recruitment metrics', description: 'Retrieves detailed recruitment metrics (time-to-hire, offer acceptance rate, etc.)' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Filter by start date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'Filter by end date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'department', required: false, description: 'Filter by department' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recruitment metrics retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getRecruitmentMetrics", null);
__decorate([
    (0, common_1.Get)('dashboard/pipeline'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pipeline view', description: 'Retrieves the recruitment pipeline view showing applications by stage' }),
    (0, swagger_1.ApiQuery)({ name: 'requisitionId', required: false, description: 'Filter by job requisition ID' }),
    (0, swagger_1.ApiQuery)({ name: 'department', required: false, description: 'Filter by department' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pipeline view retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getPipelineView", null);
__decorate([
    (0, common_1.Get)('dashboard/requisitions/:id/metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get requisition metrics', description: 'Retrieves metrics for a specific job requisition' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Job requisition ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Requisition metrics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Job requisition not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getRequisitionMetrics", null);
__decorate([
    (0, common_1.Get)('dashboard/applications-by-stage'),
    (0, swagger_1.ApiOperation)({ summary: 'Get applications by stage', description: 'Retrieves application counts grouped by stage for a requisition' }),
    (0, swagger_1.ApiQuery)({ name: 'requisitionId', required: false, description: 'Filter by job requisition ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Applications by stage retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getApplicationsByStage", null);
__decorate([
    (0, common_1.Get)('dashboard/applications-by-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get applications by status', description: 'Retrieves application counts grouped by status for a requisition' }),
    (0, swagger_1.ApiQuery)({ name: 'requisitionId', required: false, description: 'Filter by job requisition ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Applications by status retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getApplicationsByStatus", null);
__decorate([
    (0, common_1.Get)('dashboard/time-to-hire'),
    (0, swagger_1.ApiOperation)({ summary: 'Get time-to-hire metrics', description: 'Retrieves time-to-hire metrics for recruitment analysis' }),
    (0, swagger_1.ApiQuery)({ name: 'requisitionId', required: false, description: 'Filter by job requisition ID' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Filter by start date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'Filter by end date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'department', required: false, description: 'Filter by department' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Time-to-hire metrics retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecruitmentController.prototype, "getTimeToHireMetrics", null);
exports.RecruitmentController = RecruitmentController = __decorate([
    (0, swagger_1.ApiTags)('recruitment'),
    (0, common_1.Controller)('recruitment'),
    __metadata("design:paramtypes", [recruitment_service_1.RecruitmentService])
], RecruitmentController);
//# sourceMappingURL=recruitment.controller.js.map