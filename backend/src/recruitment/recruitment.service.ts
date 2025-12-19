import * as path from 'path';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  JobTemplate,
  JobTemplateDocument,
} from './models/job-template.schema';
import {
  JobRequisition,
  JobRequisitionDocument,
} from './models/job-requisition.schema';
import {
  Application,
  ApplicationDocument,
} from './models/application.schema';
import {
  ApplicationStatusHistory,
  ApplicationStatusHistoryDocument,
} from './models/application-history.schema';
import { Interview, InterviewDocument } from './models/interview.schema';
import {
  AssessmentResult,
  AssessmentResultDocument,
} from './models/assessment-result.schema';
import { Offer, OfferDocument } from './models/offer.schema';
import { Contract, ContractDocument } from './models/contract.schema';
import { Onboarding, OnboardingDocument } from './models/onboarding.schema';
import {
  TerminationRequest,
  TerminationRequestDocument,
} from './models/termination-request.schema';
import {
  ClearanceChecklist,
  ClearanceChecklistDocument,
} from './models/clearance-checklist.schema';
import { Referral, ReferralDocument } from './models/referral.schema';
import { Document, DocumentDocument } from './models/document.schema';
import {
  CreateJobTemplateDto,
  UpdateJobTemplateDto,
  CreateJobRequisitionDto,
  UpdateJobRequisitionDto,
  CreateApplicationDto,
  UpdateApplicationStageDto,
  UpdateApplicationStatusDto,
  CreateInterviewDto,
  UpdateInterviewDto,
  CreateAssessmentResultDto,
  CreateOfferDto,
  CreateContractDto,
  CreateOnboardingDto,
  UpdateOnboardingTaskDto,
  CreateTerminationRequestDto,
  UpdateTerminationStatusDto,
  UpdateClearanceChecklistDto,
  RevokeAccessDto,
  TriggerFinalSettlementDto,
  CreateReferralDto,
  CreateDocumentDto,
  UpdateDocumentDto,
} from './dto';
import { ApplicationStage } from './enums/application-stage.enum';
import { ApplicationStatus } from './enums/application-status.enum';
import { InterviewStatus } from './enums/interview-status.enum';
import { OfferResponseStatus } from './enums/offer-response-status.enum';
import { OfferFinalStatus } from './enums/offer-final-status.enum';
import { ApprovalStatus } from './enums/approval-status.enum';
import { TerminationStatus } from './enums/termination-status.enum';
import { EmployeeProfileService } from '../employee-profile/employee-profile.service';
import { Candidate, CandidateDocument } from '../employee-profile/models/candidate.schema';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import { EmployeeStatus, DeactivationReason, ContractType } from '../employee-profile/enums/employee-profile.enums';
import { Logger } from '@nestjs/common';
import { Consent, ConsentDocument } from './models/consent.schema';
import { NotificationIntegrationService } from './integrations/notification-integration.service';
import { PayrollIntegrationService } from './integrations/payroll-integration.service';
import { LeavesIntegrationService } from './integrations/leaves-integration.service';
import { TimeManagementIntegrationService } from './integrations/time-management-integration.service';
import { EmailIntegrationService } from './integrations/email-integration.service';
import { PdfIntegrationService } from './integrations/pdf-integration.service';
import { CalendarIntegrationService } from './integrations/calendar-integration.service';
import { CreateConsentDto } from './dto/create-consent.dto';
import { OnboardingTaskStatus } from './enums/onboarding-task-status.enum';

/**
 * Recruitment Service
 *
 * This service manages the complete recruitment lifecycle including:
 * - Job templates and requisitions
 * - Candidate applications and pipeline management
 * - Interview scheduling and assessment
 * - Offer creation, approval, and signing
 * - Contract management
 * - Onboarding process
 * - Termination requests and clearance
 * - Employee referrals
 * - Document management
 * - Recruitment analytics and reporting
 */
@Injectable()
export class RecruitmentService {
  private readonly logger = new Logger(RecruitmentService.name);

  constructor(
    // ========== Model Injections ==========
    @InjectModel(JobTemplate.name)
    private jobTemplateModel: Model<JobTemplateDocument>,
    @InjectModel(JobRequisition.name)
    private jobRequisitionModel: Model<JobRequisitionDocument>,
    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,
    @InjectModel(ApplicationStatusHistory.name)
    private applicationHistoryModel: Model<ApplicationStatusHistoryDocument>,
    @InjectModel(Interview.name)
    private interviewModel: Model<InterviewDocument>,
    @InjectModel(AssessmentResult.name)
    private assessmentResultModel: Model<AssessmentResultDocument>,
    @InjectModel(Offer.name)
    private offerModel: Model<OfferDocument>,
    @InjectModel(Contract.name)
    private contractModel: Model<ContractDocument>,
    @InjectModel(Onboarding.name)
    private onboardingModel: Model<OnboardingDocument>,
    @InjectModel(TerminationRequest.name)
    private terminationRequestModel: Model<TerminationRequestDocument>,
    @InjectModel(ClearanceChecklist.name)
    private clearanceChecklistModel: Model<ClearanceChecklistDocument>,
    @InjectModel(Referral.name)
    private referralModel: Model<ReferralDocument>,
    @InjectModel(Document.name)
    private documentModel: Model<DocumentDocument>,
    @InjectModel(Candidate.name)
    private candidateModel: Model<CandidateDocument>,
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
    @InjectModel(Consent.name)
    private consentModel: Model<ConsentDocument>,

    // ========== Service Dependencies ==========
    private employeeProfileService: EmployeeProfileService,
    private notificationIntegration: NotificationIntegrationService,
    private payrollIntegration: PayrollIntegrationService,
    private leavesIntegration: LeavesIntegrationService,
    private timeManagementIntegration: TimeManagementIntegrationService,
    private emailIntegration: EmailIntegrationService,
    private pdfIntegration: PdfIntegrationService,
    private calendarIntegration: CalendarIntegrationService,
  ) {}

  // ============================================================================
  // SECTION 1: JOB TEMPLATE METHODS
  // ============================================================================

  /**
   * Create a new job template
   * @param createDto - Job template creation data
   * @returns Created job template document
   */
  async createJobTemplate(
    createDto: CreateJobTemplateDto,
  ): Promise<JobTemplateDocument> {
    const jobTemplate = new this.jobTemplateModel(createDto);
    return await jobTemplate.save();
  }

  /**
   * Find all job templates with optional filters
   * @param filters - Optional filters (department, title, etc.)
   * @returns Array of job template documents
   */
  async findAllJobTemplates(
    filters?: any,
  ): Promise<JobTemplateDocument[]> {
    const query = this.jobTemplateModel.find();

    if (filters?.department) {
      query.where('department').equals(filters.department);
    }
    if (filters?.title) {
      query.where('title').regex(new RegExp(filters.title, 'i'));
    }

    return await query.exec();
  }

  /**
   * Find job template by ID
   * @param id - Job template ID
   * @returns Job template document
   * @throws NotFoundException if template not found
   */
  async findJobTemplateById(id: string): Promise<JobTemplateDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid job template ID');
    }

    const template = await this.jobTemplateModel.findById(id).exec();
    if (!template) {
      throw new NotFoundException(`Job template with ID ${id} not found`);
    }
    return template;
  }

  /**
   * Update job template
   * @param id - Job template ID
   * @param updateDto - Update data
   * @returns Updated job template document
   * @throws NotFoundException if template not found
   */
  async updateJobTemplate(
    id: string,
    updateDto: UpdateJobTemplateDto,
  ): Promise<JobTemplateDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid job template ID');
    }

    const template = await this.jobTemplateModel
      .findByIdAndUpdate(id, updateDto, { new: true, runValidators: true })
      .exec();

    if (!template) {
      throw new NotFoundException(`Job template with ID ${id} not found`);
    }
    return template;
  }

  /**
   * Delete job template
   * @param id - Job template ID
   * @throws NotFoundException if template not found
   */
  async deleteJobTemplate(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid job template ID');
    }

    const template = await this.jobTemplateModel.findByIdAndDelete(id).exec();
    if (!template) {
      throw new NotFoundException(`Job template with ID ${id} not found`);
    }
  }

  // ============================================================================
  // SECTION 2: JOB REQUISITION METHODS
  // ============================================================================

  /**
   * Create a new job requisition
   * @param createDto - Job requisition creation data
   * @returns Created job requisition document
   * @throws BadRequestException if template ID is invalid
   */
  async createJobRequisition(
    createDto: CreateJobRequisitionDto,
  ): Promise<JobRequisitionDocument> {
    // Validate template ID if provided
    if (createDto.templateId && !Types.ObjectId.isValid(createDto.templateId)) {
      throw new BadRequestException('Invalid template ID');
    }

    // Validate hiring manager ID
    if (!Types.ObjectId.isValid(createDto.hiringManagerId)) {
      throw new BadRequestException('Invalid hiring manager ID');
    }

    // Convert comma-separated tags string to array
    const tagsArray = createDto.tags
      ? createDto.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : [];

    const requisition = new this.jobRequisitionModel({
      ...createDto,
      templateId: createDto.templateId
        ? new Types.ObjectId(createDto.templateId)
        : undefined,
      departmentId: createDto.departmentId
        ? new Types.ObjectId(createDto.departmentId)
        : undefined,
      hiringManagerId: new Types.ObjectId(createDto.hiringManagerId),
      postingDate: createDto.postingDate
        ? new Date(createDto.postingDate)
        : undefined,
      expiryDate: createDto.expiryDate
        ? new Date(createDto.expiryDate)
        : undefined,
      tags: tagsArray,
    });

    return await requisition.save();
  }

  /**
   * Find all job requisitions with optional filters
   * @param filters - Optional filters (publishStatus, hiringManagerId, etc.)
   * @returns Array of job requisition documents
   */
  async findAllJobRequisitions(
    filters?: any,
  ): Promise<JobRequisitionDocument[]> {
    const query = this.jobRequisitionModel.find().populate('templateId').populate('hiringManagerId').populate('departmentId', 'name code');

    // Support both 'status' (from frontend) and 'publishStatus' (backend field name)
    const publishStatus = filters?.publishStatus || filters?.status;
    if (publishStatus) {
      query.where('publishStatus').equals(publishStatus);
    }
    if (filters?.hiringManagerId) {
      query.where('hiringManagerId').equals(filters.hiringManagerId);
    }
    if (filters?.location) {
      query.where('location').regex(new RegExp(filters.location, 'i'));
    }

    return await query.exec();
  }

  /**
   * Find all published job requisitions (public endpoint)
   * @returns Array of published job requisition documents
   */
  async findPublishedJobRequisitions(): Promise<JobRequisitionDocument[]> {
    return await this.jobRequisitionModel
      .find({ publishStatus: 'published' })
      .populate('templateId')
      .populate('hiringManagerId')
      .populate('departmentId', 'name code')
      .exec();
  }

  /**
   * Find job requisition by ID
   * @param id - Job requisition ID
   * @returns Job requisition document with populated relations
   * @throws NotFoundException if requisition not found
   */
  async findJobRequisitionById(
    id: string,
  ): Promise<JobRequisitionDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid job requisition ID');
    }

    const requisition = await this.jobRequisitionModel
      .findById(id)
      .populate('templateId')
      .populate('hiringManagerId')
      .populate('departmentId', 'name code')
      .exec();

    if (!requisition) {
      throw new NotFoundException(`Job requisition with ID ${id} not found`);
    }
    return requisition;
  }

  /**
   * Update job requisition
   * @param id - Job requisition ID
   * @param updateDto - Update data
   * @returns Updated job requisition document
   * @throws NotFoundException if requisition not found
   */
  async updateJobRequisition(
    id: string,
    updateDto: UpdateJobRequisitionDto,
  ): Promise<JobRequisitionDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid job requisition ID');
    }

    const updateData: any = { ...updateDto };
    if (updateDto.templateId) {
      updateData.templateId = new Types.ObjectId(updateDto.templateId);
    }
    if (updateDto.departmentId) {
      updateData.departmentId = new Types.ObjectId(updateDto.departmentId);
    }
    if (updateDto.hiringManagerId) {
      updateData.hiringManagerId = new Types.ObjectId(updateDto.hiringManagerId);
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
      .populate('departmentId', 'name code')
      .exec();

    if (!requisition) {
      throw new NotFoundException(`Job requisition with ID ${id} not found`);
    }
    return requisition;
  }

  /**
   * Publish a job requisition
   * @param id - Job requisition ID
   * @returns Updated job requisition document
   * @throws NotFoundException if requisition not found
   * @throws BadRequestException if requisition is already published or closed
   */
  async publishJobRequisition(
    id: string,
  ): Promise<JobRequisitionDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid job requisition ID');
    }

    const requisition = await this.jobRequisitionModel.findById(id).exec();
    if (!requisition) {
      throw new NotFoundException(`Job requisition with ID ${id} not found`);
    }

    if (requisition.publishStatus === 'published') {
      throw new BadRequestException('Job requisition is already published');
    }
    if (requisition.publishStatus === 'closed') {
      throw new BadRequestException('Cannot publish a closed job requisition');
    }

    requisition.publishStatus = 'published';
    if (!requisition.postingDate) {
      requisition.postingDate = new Date();
    }

    return await requisition.save();
  }

  /**
   * Close a job requisition
   * @param id - Job requisition ID
   * @returns Updated job requisition document
   * @throws NotFoundException if requisition not found
   */
  async closeJobRequisition(
    id: string,
  ): Promise<JobRequisitionDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid job requisition ID');
    }

    const requisition = await this.jobRequisitionModel.findById(id).exec();
    if (!requisition) {
      throw new NotFoundException(`Job requisition with ID ${id} not found`);
    }

    requisition.publishStatus = 'closed';
    return await requisition.save();
  }

  /**
   * Preview job requisition (returns formatted view with template data)
   * @param id - Job requisition ID
   * @returns Preview data with template information
   * @throws NotFoundException if requisition not found
   */
  async previewJobRequisition(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid job requisition ID');
    }

    const requisition = await this.jobRequisitionModel
      .findById(id)
      .populate('templateId')
      .populate('hiringManagerId')
      .populate('departmentId', 'name code')
      .exec();

    if (!requisition) {
      throw new NotFoundException(`Job requisition with ID ${id} not found`);
    }

    // Return formatted preview data
    return {
      requisitionId: requisition.requisitionId,
      title: requisition.title,
      department: requisition.departmentId,
      template: requisition.templateId,
      openings: requisition.openings,
      location: requisition.location,
      hiringManager: requisition.hiringManagerId,
      publishStatus: requisition.publishStatus,
      postingDate: requisition.postingDate,
      expiryDate: requisition.expiryDate,
    };
  }

  /**
   * Delete job requisition
   * @param id - Job requisition ID
   * @throws NotFoundException if requisition not found
   * @throws ConflictException if requisition has active applications
   */
  async deleteJobRequisition(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid job requisition ID');
    }

    // Check if there are active applications
    const activeApplications = await this.applicationModel
      .countDocuments({ requisitionId: new Types.ObjectId(id) })
      .exec();

    if (activeApplications > 0) {
      throw new ConflictException(
        'Cannot delete job requisition with active applications',
      );
    }

    const requisition = await this.jobRequisitionModel
      .findByIdAndDelete(id)
      .exec();
    if (!requisition) {
      throw new NotFoundException(`Job requisition with ID ${id} not found`);
    }
  }

  // ============================================================================
  // SECTION 3: APPLICATION METHODS
  // ============================================================================

  /**
   * Create or find candidate by email
   * @param candidateData - Candidate information
   * @returns Candidate document
   */
  async createOrFindCandidate(candidateData: {
    firstName: string;
    lastName: string;
    personalEmail: string;
    nationalId: string;
    mobilePhone?: string;
  }): Promise<CandidateDocument> {
    // Check if candidate already exists by email
    let candidate = await this.candidateModel
      .findOne({ personalEmail: candidateData.personalEmail })
      .exec();

    if (candidate) {
      return candidate;
    }

    // Generate candidate number
    const candidateNumber = `CAND-${Date.now()}`;

    // Create new candidate
    candidate = new this.candidateModel({
      candidateNumber,
      firstName: candidateData.firstName,
      lastName: candidateData.lastName,
      fullName: `${candidateData.firstName} ${candidateData.lastName}`,
      personalEmail: candidateData.personalEmail,
      nationalId: candidateData.nationalId,
      mobilePhone: candidateData.mobilePhone,
      applicationDate: new Date(),
    });

    return await candidate.save();
  }

  /**
   * Create a new application
   * @param createDto - Application creation data
   * @returns Created application document
   * @throws BadRequestException if candidate or requisition ID is invalid
   */
  async createApplication(
    createDto: CreateApplicationDto,
  ): Promise<ApplicationDocument> {
    if (!Types.ObjectId.isValid(createDto.candidateId)) {
      throw new BadRequestException('Invalid candidate ID');
    }
    if (!Types.ObjectId.isValid(createDto.requisitionId)) {
      throw new BadRequestException('Invalid requisition ID');
    }

    // Validate requisition exists and is published
    const requisition = await this.jobRequisitionModel
      .findById(createDto.requisitionId)
      .exec();
    if (!requisition) {
      throw new NotFoundException(
        `Job requisition with ID ${createDto.requisitionId} not found`,
      );
    }

    // Only allow applications to published requisitions
    if (requisition.publishStatus !== 'published') {
      throw new BadRequestException(
        'Applications can only be submitted to published job requisitions',
      );
    }

    // Check if requisition has expired
    if (requisition.expiryDate && new Date(requisition.expiryDate) < new Date()) {
      throw new BadRequestException(
        'This job requisition has expired and is no longer accepting applications',
      );
    }

    // Check if application already exists
    const existingApplication = await this.applicationModel
      .findOne({
        candidateId: new Types.ObjectId(createDto.candidateId),
        requisitionId: new Types.ObjectId(createDto.requisitionId),
      })
      .exec();

    if (existingApplication) {
      throw new ConflictException(
        'Application already exists for this candidate and requisition',
      );
    }

    const application = new this.applicationModel({
      candidateId: new Types.ObjectId(createDto.candidateId),
      requisitionId: new Types.ObjectId(createDto.requisitionId),
      assignedHr: createDto.assignedHr
        ? new Types.ObjectId(createDto.assignedHr)
        : undefined,
      currentStage: ApplicationStage.SCREENING,
      status: ApplicationStatus.SUBMITTED,
    });

    const savedApplication = await application.save();

    // Create initial history entry
    await this.createApplicationHistoryEntry(
      savedApplication._id.toString(),
      null,
      ApplicationStage.SCREENING,
      null,
      ApplicationStatus.SUBMITTED,
      createDto.assignedHr || createDto.candidateId,
    );

    return savedApplication;
  }

  /**
   * Find all applications with optional filters
   * @param filters - Optional filters (status, stage, requisitionId, etc.)
   * @returns Array of application documents
   */
  async findAllApplications(
    filters?: any,
  ): Promise<ApplicationDocument[]> {
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

  /**
   * Find application by ID
   * @param id - Application ID
   * @returns Application document with populated relations
   * @throws NotFoundException if application not found
   */
  async findApplicationById(
    id: string,
    userId?: string,
    userRoles?: string[],
  ): Promise<ApplicationDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid application ID');
    }

    const application = await this.applicationModel
      .findById(id)
      .populate('candidateId')
      .populate('requisitionId')
      .populate('assignedHr')
      .exec();

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    // Ownership validation: JOB_CANDIDATE can only access their own applications
    if (userId && userRoles?.includes('Job Candidate')) {
      const candidateId = application.candidateId?.toString();
      if (candidateId !== userId) {
        throw new ForbiddenException(
          'You are not authorized to access this application',
        );
      }
    }

    return application;
  }

  /**
   * Update application stage
   * @param id - Application ID
   * @param updateDto - Stage update data
   * @returns Updated application document
   * @throws NotFoundException if application not found
   */
  async updateApplicationStage(
    id: string,
    updateDto: UpdateApplicationStageDto,
  ): Promise<ApplicationDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid application ID');
    }

    const application = await this.applicationModel.findById(id).exec();
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    const oldStage = application.currentStage;
    application.currentStage = updateDto.currentStage;

    const updated = await application.save();

    // Create history entry
    await this.createApplicationHistoryEntry(
      id,
      oldStage,
      updateDto.currentStage,
      application.status,
      application.status,
      application.assignedHr?.toString() || application.candidateId.toString(),
    );

    // Populate relations before returning
    return await this.applicationModel
      .findById(id)
      .populate('candidateId')
      .populate('requisitionId')
      .populate('assignedHr')
      .exec() as ApplicationDocument;
  }

  /**
   * Update application status
   * @param id - Application ID
   * @param updateDto - Status update data
   * @returns Updated application document
   * @throws NotFoundException if application not found
   */
  async updateApplicationStatus(
    id: string,
    updateDto: UpdateApplicationStatusDto,
  ): Promise<ApplicationDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid application ID');
    }

    const application = await this.applicationModel.findById(id).exec();
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    const oldStatus = application.status;
    application.status = updateDto.status;

    const updated = await application.save();

    // Create history entry
    await this.createApplicationHistoryEntry(
      id,
      application.currentStage,
      application.currentStage,
      oldStatus,
      updateDto.status,
      application.assignedHr?.toString() || application.candidateId.toString(),
    );

    // Populate relations before returning
    const populated = await this.applicationModel
      .findById(id)
      .populate('candidateId')
      .populate('requisitionId')
      .populate('assignedHr')
      .exec() as ApplicationDocument;

    // Send notification for status update
    if (oldStatus !== updateDto.status) {
      const candidate = await this.candidateModel.findById(application.candidateId).exec();
      if (candidate) {
        await this.notificationIntegration.notifyApplicationStatusUpdate(
          candidate._id.toString(),
          id,
          updateDto.status,
          application.currentStage,
        );

        // Send rejection notification if status is REJECTED
        if (updateDto.status === ApplicationStatus.REJECTED) {
          await this.notificationIntegration.notifyRejection(
            candidate._id.toString(),
            id,
          );
          // Also send email
          await this.emailIntegration.sendRejectionEmail(
            candidate.personalEmail || '',
            candidate.fullName || `${candidate.firstName} ${candidate.lastName}`,
            id,
          );
        }
      }
    }

    return populated;
  }

  /**
   * Assign HR to application
   * @param id - Application ID
   * @param hrId - HR employee ID
   * @returns Updated application document
   * @throws NotFoundException if application not found
   */
  async assignHrToApplication(
    id: string,
    hrId: string,
  ): Promise<ApplicationDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid application ID');
    }
    if (!Types.ObjectId.isValid(hrId)) {
      throw new BadRequestException('Invalid HR employee ID');
    }

    const application = await this.applicationModel
      .findByIdAndUpdate(
        id,
        { assignedHr: new Types.ObjectId(hrId) },
        { new: true, runValidators: true },
      )
      .populate('candidateId')
      .populate('requisitionId')
      .populate('assignedHr')
      .exec();

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    return application;
  }

  /**
   * Get application status history
   * @param id - Application ID
   * @returns Array of application history documents
   */
  async getApplicationHistory(
    id: string,
    userId?: string,
    userRoles?: string[],
  ): Promise<ApplicationStatusHistoryDocument[]> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid application ID');
    }

    // Ownership validation: JOB_CANDIDATE can only access their own application history
    if (userId && userRoles?.includes('Job Candidate')) {
      const application = await this.applicationModel.findById(id).exec();
      if (!application) {
        throw new NotFoundException(`Application with ID ${id} not found`);
      }
      const candidateId = application.candidateId?.toString();
      if (candidateId !== userId) {
        throw new ForbiddenException(
          'You are not authorized to access this application history',
        );
      }
    }

    return await this.applicationHistoryModel
      .find({ applicationId: new Types.ObjectId(id) })
      .populate('changedBy')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get application communication logs
   * @param id - Application ID
   * @returns Array of communication log entries
   * @note This is a placeholder - communication logs may be stored elsewhere
   */
  async getApplicationCommunicationLogs(
    id: string,
    userId?: string,
    userRoles?: string[],
  ): Promise<any[]> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid application ID');
    }

    // Ownership validation: JOB_CANDIDATE can only access their own communication logs
    if (userId && userRoles?.includes('Job Candidate')) {
      const application = await this.applicationModel.findById(id).exec();
      if (!application) {
        throw new NotFoundException(`Application with ID ${id} not found`);
      }
      const candidateId = application.candidateId?.toString();
      if (candidateId !== userId) {
        throw new ForbiddenException(
          'You are not authorized to access this application communication logs',
        );
      }
    }

    // TODO: Implement communication logs storage and retrieval
    // This could be a separate collection or integrated with application history
    return [];
  }

  /**
   * Record consent for application
   * @param id - Application ID
   * @param consentDto - Consent data
   * @returns Consent record
   */
  async recordConsent(id: string, consentDto: CreateConsentDto): Promise<ConsentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid application ID');
    }

    // Check if application exists
    const application = await this.applicationModel.findById(id).exec();
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    // Check if consent already exists
    const existingConsent = await this.consentModel
      .findOne({ applicationId: new Types.ObjectId(id) })
      .exec();

    if (existingConsent) {
      // Update existing consent
      existingConsent.consentGiven = consentDto.consentGiven;
      existingConsent.consentType = consentDto.consentType;
      existingConsent.consentDate = new Date();
      existingConsent.ipAddress = consentDto.ipAddress;
      existingConsent.userAgent = consentDto.userAgent;
      if (!consentDto.consentGiven) {
        existingConsent.withdrawnAt = new Date();
      }
      return await existingConsent.save();
    }

    // Create new consent
    const consent = new this.consentModel({
      applicationId: new Types.ObjectId(id),
      consentGiven: consentDto.consentGiven,
      consentType: consentDto.consentType,
      consentDate: new Date(),
      ipAddress: consentDto.ipAddress,
      userAgent: consentDto.userAgent,
    });

    return await consent.save();
  }

  /**
   * Get consent status
   * @param id - Application ID
   * @returns Consent status
   */
  async getConsentStatus(id: string): Promise<ConsentDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid application ID');
    }

    return await this.consentModel
      .findOne({ applicationId: new Types.ObjectId(id) })
      .exec();
  }

  // ============================================================================
  // SECTION 4: INTERVIEW METHODS
  // ============================================================================

  /**
   * Create a new interview
   * @param createDto - Interview creation data
   * @returns Created interview document
   * @throws BadRequestException if application ID is invalid
   */
  async createInterview(
    createDto: CreateInterviewDto,
  ): Promise<InterviewDocument> {
    if (!Types.ObjectId.isValid(createDto.applicationId)) {
      throw new BadRequestException('Invalid application ID');
    }

    // Validate application exists
    const application = await this.applicationModel
      .findById(createDto.applicationId)
      .exec();
    if (!application) {
      throw new NotFoundException(
        `Application with ID ${createDto.applicationId} not found`,
      );
    }

    const interview = new this.interviewModel({
      applicationId: new Types.ObjectId(createDto.applicationId),
      stage: createDto.stage,
      scheduledDate: createDto.scheduledDate
        ? new Date(createDto.scheduledDate)
        : undefined,
      method: createDto.method,
      panel: createDto.panel
        ? createDto.panel.map((id) => new Types.ObjectId(id))
        : [],
      calendarEventId: createDto.calendarEventId,
      videoLink: createDto.videoLink,
      status: InterviewStatus.SCHEDULED,
    });

    return await interview.save();
  }

  /**
   * Find all interviews with optional filters
   * @param filters - Optional filters (status, applicationId, stage, etc.)
   * @returns Array of interview documents
   */
  async findAllInterviews(filters?: any): Promise<InterviewDocument[]> {
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

  /**
   * Find interview by ID
   * @param id - Interview ID
   * @returns Interview document with populated relations
   * @throws NotFoundException if interview not found
   */
  async findInterviewById(
    id: string,
    userId?: string,
    userRoles?: string[],
  ): Promise<InterviewDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid interview ID');
    }

    const interview = await this.interviewModel
      .findById(id)
      .populate('applicationId')
      .populate('panel')
      .populate('feedbackId')
      .exec();

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    // Ownership validation: JOB_CANDIDATE can only access their own interviews
    if (userId && userRoles?.includes('Job Candidate')) {
      const application = interview.applicationId as any;
      const candidateId = application?.candidateId?.toString();
      if (candidateId !== userId) {
        throw new ForbiddenException(
          'You are not authorized to access this interview',
        );
      }
    }

    return interview;
  }

  /**
   * Update interview details
   * @param id - Interview ID
   * @param updateDto - Update data
   * @returns Updated interview document
   * @throws NotFoundException if interview not found
   */
  async updateInterview(
    id: string,
    updateDto: UpdateInterviewDto,
  ): Promise<InterviewDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid interview ID');
    }

    const updateData: any = { ...updateDto };
    if (updateDto.scheduledDate) {
      updateData.scheduledDate = new Date(updateDto.scheduledDate);
    }
    if (updateDto.panel) {
      updateData.panel = updateDto.panel.map((panelId) => new Types.ObjectId(panelId));
    }
    if (updateDto.feedbackId) {
      updateData.feedbackId = new Types.ObjectId(updateDto.feedbackId);
    }

    const interview = await this.interviewModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('applicationId')
      .populate('panel')
      .populate('feedbackId')
      .exec();

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }
    return interview;
  }

  /**
   * Update interview status
   * @param id - Interview ID
   * @param status - New interview status
   * @returns Updated interview document
   * @throws NotFoundException if interview not found
   */
  async updateInterviewStatus(
    id: string,
    status: InterviewStatus,
  ): Promise<InterviewDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid interview ID');
    }

    const interview = await this.interviewModel
      .findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true },
      )
      .exec();

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }
    return interview;
  }

  /**
   * Delete an interview
   * @param id - Interview ID
   * @returns void
   * @throws NotFoundException if interview not found
   */
  async deleteInterview(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid interview ID');
    }

    const interview = await this.interviewModel.findByIdAndDelete(id).exec();

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    this.logger.log(`Interview ${id} deleted successfully`);
  }

  /**
   * Create assessment result for an interview
   * @param createDto - Assessment result creation data
   * @returns Created assessment result document
   * @throws BadRequestException if interview or interviewer ID is invalid
   */
  async createAssessmentResult(
    createDto: CreateAssessmentResultDto,
  ): Promise<AssessmentResultDocument> {
    if (!Types.ObjectId.isValid(createDto.interviewId)) {
      throw new BadRequestException('Invalid interview ID');
    }
    if (!Types.ObjectId.isValid(createDto.interviewerId)) {
      throw new BadRequestException('Invalid interviewer ID');
    }

    // Validate interview exists
    const interview = await this.interviewModel
      .findById(createDto.interviewId)
      .exec();
    if (!interview) {
      throw new NotFoundException(
        `Interview with ID ${createDto.interviewId} not found`,
      );
    }

    const assessment = new this.assessmentResultModel({
      interviewId: new Types.ObjectId(createDto.interviewId),
      interviewerId: new Types.ObjectId(createDto.interviewerId),
      score: createDto.score,
      comments: createDto.comments,
    });

    const savedAssessment = await assessment.save();

    // Link assessment to interview
    await this.interviewModel
      .findByIdAndUpdate(createDto.interviewId, {
        feedbackId: savedAssessment._id,
      })
      .exec();

    return savedAssessment;
  }

  /**
   * Get interview assessment
   * @param id - Interview ID
   * @returns Assessment result document or null
   */
  async getInterviewAssessment(
    id: string,
  ): Promise<AssessmentResultDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid interview ID');
    }

    const interview = await this.interviewModel.findById(id).exec();
    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    if (!interview.feedbackId) {
      return null;
    }

    return await this.assessmentResultModel
      .findById(interview.feedbackId)
      .populate('interviewerId')
      .exec();
  }

  /**
   * Send calendar invite for interview
   * @param id - Interview ID
   * @returns Calendar invite information
   */
  async sendCalendarInvite(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid interview ID');
    }

    const interview = await this.interviewModel
      .findById(id)
      .populate('applicationId')
      .populate('panel')
      .exec();

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    const application = await this.applicationModel
      .findById(interview.applicationId)
      .populate('candidateId')
      .exec();

    if (!application) {
      throw new NotFoundException('Application not found for interview');
    }

    const candidate = application.candidateId as any;
    const endDate = new Date(interview.scheduledDate);
    endDate.setHours(endDate.getHours() + 1); // 1 hour interview

    // Generate calendar invite
    const icsContent = await this.calendarIntegration.generateCalendarInvite(
      `Interview - ${candidate.fullName || `${candidate.firstName} ${candidate.lastName}`}`,
      `Interview for position. Method: ${interview.method}`,
      interview.scheduledDate,
      endDate,
      interview.videoLink || '', // Use videoLink as location for virtual interviews, empty for in-person
      [
        { email: candidate.personalEmail || '', name: candidate.fullName || `${candidate.firstName} ${candidate.lastName}` },
        ...(interview.panel || []).map((p: any) => ({ email: p.email || '', name: p.fullName || `${p.firstName} ${p.lastName}` })),
      ],
    );

    // Send notifications
    await this.notificationIntegration.notifyInterviewScheduled(
      candidate._id.toString(),
      id,
      interview.scheduledDate,
      interview.method,
    );

    // Send email with calendar invite
    await this.emailIntegration.sendInterviewInviteEmail(
      candidate.personalEmail || '',
      candidate.fullName || `${candidate.firstName} ${candidate.lastName}`,
      id,
      interview.scheduledDate,
      interview.method,
      interview.videoLink,
      interview.videoLink || '', // Use videoLink as location for virtual interviews
    );

    // Notify panel members
    if (interview.panel && interview.panel.length > 0) {
      const panelIds = interview.panel.map((p: any) => p._id?.toString() || p.toString());
      await this.notificationIntegration.notifyPanelMembers(
        panelIds,
        id,
        interview.scheduledDate,
        candidate.fullName || `${candidate.firstName} ${candidate.lastName}`,
      );
    }

    return {
      interviewId: id,
      scheduledDate: interview.scheduledDate,
      calendarEventId: interview.calendarEventId,
      icsContent,
      message: 'Calendar invite sent successfully',
    };
  }

  // ============================================================================
  // SECTION 5: OFFER METHODS
  // ============================================================================

  /**
   * Create a new job offer
   * @param createDto - Offer creation data
   * @returns Created offer document
   * @throws BadRequestException if application or candidate ID is invalid
   */
  async createOffer(createDto: CreateOfferDto): Promise<OfferDocument> {
    if (!Types.ObjectId.isValid(createDto.applicationId)) {
      throw new BadRequestException('Invalid application ID');
    }
    if (!Types.ObjectId.isValid(createDto.candidateId)) {
      throw new BadRequestException('Invalid candidate ID');
    }

    // Validate application exists and is in correct stage
    const application = await this.applicationModel
      .findById(createDto.applicationId)
      .exec();
    if (!application) {
      throw new NotFoundException(
        `Application with ID ${createDto.applicationId} not found`,
      );
    }

    // Check if offer already exists for this application
    const existingOffer = await this.offerModel
      .findOne({ applicationId: new Types.ObjectId(createDto.applicationId) })
      .exec();

    if (existingOffer) {
      throw new ConflictException(
        'Offer already exists for this application',
      );
    }

    const offer = new this.offerModel({
      applicationId: new Types.ObjectId(createDto.applicationId),
      candidateId: new Types.ObjectId(createDto.candidateId),
      hrEmployeeId: createDto.hrEmployeeId
        ? new Types.ObjectId(createDto.hrEmployeeId)
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
            employeeId: new Types.ObjectId(approver.employeeId),
            role: approver.role,
            status: approver.status,
            actionDate: approver.actionDate
              ? new Date(approver.actionDate)
              : undefined,
            comment: approver.comment,
          }))
        : [],
      applicantResponse: OfferResponseStatus.PENDING,
      finalStatus: createDto.approvers?.length
        ? ApprovalStatus.PENDING
        : ApprovalStatus.APPROVED,
    });

    const savedOffer = await offer.save();

    // Update application status to OFFER
    await this.applicationModel
      .findByIdAndUpdate(createDto.applicationId, {
        status: ApplicationStatus.OFFER,
        currentStage: ApplicationStage.OFFER,
      })
      .exec();

    // Create history entry
    await this.createApplicationHistoryEntry(
      createDto.applicationId,
      application.currentStage,
      ApplicationStage.OFFER,
      application.status,
      ApplicationStatus.OFFER,
      createDto.hrEmployeeId || application.assignedHr?.toString() || '',
    );

    return savedOffer;
  }

  /**
   * Find all offers with optional filters
   * @param filters - Optional filters (status, candidateId, etc.)
   * @returns Array of offer documents
   */
  async findAllOffers(filters?: any): Promise<OfferDocument[]> {
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

  /**
   * Find offer by ID
   * @param id - Offer ID
   * @returns Offer document with populated relations
   * @throws NotFoundException if offer not found
   */
  async findOfferById(
    id: string,
    userId?: string,
    userRoles?: string[],
  ): Promise<OfferDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerModel
      .findById(id)
      .populate('applicationId')
      .populate('candidateId')
      .populate('hrEmployeeId')
      .populate('approvers.employeeId')
      .exec();

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    // Ownership validation: JOB_CANDIDATE can only access their own offers
    if (userId && userRoles?.includes('Job Candidate')) {
      const candidateId = offer.candidateId?.toString();
      if (candidateId !== userId) {
        throw new ForbiddenException(
          'You are not authorized to access this offer',
        );
      }
    }

    return offer;
  }

  /**
   * Update offer details
   * @param id - Offer ID
   * @param updateDto - Update data
   * @returns Updated offer document
   * @throws NotFoundException if offer not found
   */
  async updateOffer(id: string, updateDto: any): Promise<OfferDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const updateData: any = { ...updateDto };
    if (updateDto.deadline) {
      updateData.deadline = new Date(updateDto.deadline);
    }

    const offer = await this.offerModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('applicationId')
      .populate('candidateId')
      .exec();

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }
    return offer;
  }

  /**
   * Update candidate response to offer
   * @param id - Offer ID
   * @param response - Candidate response status
   * @param userId - Current user ID (for ownership validation)
   * @param userRoles - Current user roles (for ownership validation)
   * @returns Updated offer document
   * @throws NotFoundException if offer not found
   * @throws ForbiddenException if user is not authorized
   */
  async updateOfferResponse(
    id: string,
    response: OfferResponseStatus,
    userId?: string,
    userRoles?: string[],
  ): Promise<OfferDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerModel.findById(id).exec();
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    // Ownership validation: JOB_CANDIDATE can only update their own offer responses
    // HR roles can update any offer response
    if (userId && userRoles?.includes('Job Candidate')) {
      const candidateId = offer.candidateId?.toString();
      if (candidateId !== userId) {
        throw new ForbiddenException(
          'You are not authorized to update this offer response',
        );
      }
    }

    if (offer.applicantResponse !== OfferResponseStatus.PENDING) {
      throw new BadRequestException('Offer response has already been submitted');
    }

    offer.applicantResponse = response;
    const updated = await offer.save();

    // If accepted, update application status
    if (response === OfferResponseStatus.ACCEPTED) {
      await this.applicationModel
        .findByIdAndUpdate(offer.applicationId, {
          status: ApplicationStatus.HIRED,
        })
        .exec();
    } else if (response === OfferResponseStatus.REJECTED) {
      await this.applicationModel
        .findByIdAndUpdate(offer.applicationId, {
          status: ApplicationStatus.REJECTED,
        })
        .exec();
    }

    return updated;
  }

  /**
   * Update offer approval status
   * @param id - Offer ID
   * @param approverId - Approver employee ID
   * @param status - Approval status
   * @returns Updated offer document
   * @throws NotFoundException if offer not found
   */
  async updateOfferApproval(
    id: string,
    approverId: string,
    status: ApprovalStatus,
  ): Promise<OfferDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }
    if (!Types.ObjectId.isValid(approverId)) {
      throw new BadRequestException('Invalid approver ID');
    }

    const offer = await this.offerModel.findById(id).exec();
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    // Update approver status
    const approverIndex = offer.approvers.findIndex(
      (a) => a.employeeId.toString() === approverId,
    );

    if (approverIndex === -1) {
      throw new NotFoundException(
        `Approver with ID ${approverId} not found in offer approvers`,
      );
    }

    offer.approvers[approverIndex].status = status;
    offer.approvers[approverIndex].actionDate = new Date();

    // Check if all approvers have responded
    const allApproved = offer.approvers.every(
      (a) => a.status === ApprovalStatus.APPROVED,
    );
    const anyRejected = offer.approvers.some(
      (a) => a.status === ApprovalStatus.REJECTED,
    );

    if (anyRejected) {
      offer.finalStatus = OfferFinalStatus.REJECTED;
    } else if (allApproved) {
      offer.finalStatus = OfferFinalStatus.APPROVED;
    }

    return await offer.save();
  }

  /**
   * Generate signing token for offer
   * @param id - Offer ID
   * @param signerType - Type of signer (candidate, hr, manager)
   * @param expiresInDays - Token expiration in days (default: 7)
   * @returns Token string
   */
  async generateOfferSigningToken(
    id: string,
    signerType: string,
    expiresInDays: number = 7,
  ): Promise<string> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerModel.findById(id).exec();
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const updateData: any = {};
    if (signerType === 'candidate') {
      updateData.candidateSigningToken = token;
      updateData.candidateSigningTokenExpiresAt = expiresAt;
    } else if (signerType === 'hr') {
      updateData.hrSigningToken = token;
      updateData.hrSigningTokenExpiresAt = expiresAt;
    } else {
      throw new BadRequestException('Invalid signer type for offer');
    }

    await this.offerModel.findByIdAndUpdate(id, updateData).exec();

    return token;
  }

  /**
   * Validate offer signing token
   * @param id - Offer ID
   * @param token - Signing token
   * @param signerType - Type of signer
   * @returns Offer document if valid
   * @throws BadRequestException if token is invalid or expired
   */
  async validateOfferSigningToken(
    id: string,
    token: string,
    signerType: string,
  ): Promise<OfferDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerModel.findById(id).exec();
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    let isValid = false;
    if (signerType === 'candidate') {
      isValid =
        !!offer.candidateSigningToken &&
        offer.candidateSigningToken === token &&
        !!offer.candidateSigningTokenExpiresAt &&
        offer.candidateSigningTokenExpiresAt > new Date();
    } else if (signerType === 'hr') {
      isValid =
        !!offer.hrSigningToken &&
        offer.hrSigningToken === token &&
        !!offer.hrSigningTokenExpiresAt &&
        offer.hrSigningTokenExpiresAt > new Date();
    } else {
      throw new BadRequestException('Invalid signer type');
    }

    if (!isValid) {
      throw new BadRequestException('Invalid or expired signing token');
    }

    return offer;
  }

  /**
   * Sign offer (candidate/HR/manager)
   * @param id - Offer ID
   * @param signerType - Type of signer (candidate, hr, manager)
   * @param typedName - Typed name of the signer
   * @param ipAddress - IP address of the signer (optional)
   * @param token - Signing token (optional, for public signing)
   * @returns Updated offer document
   * @throws NotFoundException if offer not found
   */
  async signOffer(
    id: string,
    signerType: string,
    typedName?: string,
    ipAddress?: string,
    token?: string,
    userId?: string,
    userRoles?: string[],
  ): Promise<OfferDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerModel.findById(id).exec();
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    // If token is provided, validate it (for public signing)
    if (token) {
      await this.validateOfferSigningToken(id, token, signerType);
    }

    // Check if already signed
    if (signerType === 'candidate' && offer.candidateSignedAt) {
      throw new BadRequestException('Offer already signed by candidate');
    }
    if (signerType === 'hr' && offer.hrSignedAt) {
      throw new BadRequestException('Offer already signed by HR');
    }
    if (signerType === 'manager' && offer.managerSignedAt) {
      throw new BadRequestException('Offer already signed by manager');
    }

    const updateData: any = {};
    if (signerType === 'candidate') {
      updateData.candidateSignedAt = new Date();
      if (typedName) updateData.candidateTypedName = typedName;
      if (ipAddress) updateData.candidateSigningIp = ipAddress;
      // When candidate signs, always update applicantResponse to ACCEPTED
      updateData.applicantResponse = OfferResponseStatus.ACCEPTED;
      // Clear token after signing
      updateData.candidateSigningToken = undefined;
      updateData.candidateSigningTokenExpiresAt = undefined;
    } else if (signerType === 'hr') {
      // Verify typed name matches user's full name (case-sensitive)
      if (userId && typedName) {
        const userProfile = await this.employeeProfileModel.findById(userId).exec();
        if (!userProfile) {
          throw new BadRequestException('User profile not found');
        }
        const userFullName = userProfile.fullName || `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
        if (typedName.trim() !== userFullName) {
          throw new BadRequestException(`Name verification failed. Expected: "${userFullName}" (case-sensitive)`);
        }
      }
      updateData.hrSignedAt = new Date();
      if (typedName) updateData.hrTypedName = typedName;
      if (ipAddress) updateData.hrSigningIp = ipAddress;
      // Clear token after signing
      updateData.hrSigningToken = undefined;
      updateData.hrSigningTokenExpiresAt = undefined;
    } else if (signerType === 'manager') {
      // Manager signature can only be signed by HR Manager (not department head)
      if (userId && userRoles && userRoles.length > 0) {
        const hasHrManagerRole = userRoles.some(role => 
          role === 'HR Manager' || role === 'System Admin'
        );
        if (!hasHrManagerRole) {
          throw new BadRequestException('Only HR Manager can sign as manager');
        }
      }
      
      // Verify typed name matches user's full name (case-sensitive)
      if (userId && typedName) {
        const userProfile = await this.employeeProfileModel.findById(userId).exec();
        if (!userProfile) {
          throw new BadRequestException('User profile not found');
        }
        const userFullName = userProfile.fullName || `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
        if (typedName.trim() !== userFullName) {
          throw new BadRequestException(`Name verification failed. Expected: "${userFullName}" (case-sensitive)`);
        }
      }
      updateData.managerSignedAt = new Date();
      if (typedName) updateData.managerTypedName = typedName;
      if (ipAddress) updateData.managerSigningIp = ipAddress;
    } else {
      throw new BadRequestException('Invalid signer type');
    }

    const updated = await this.offerModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    // If both candidate and HR have signed, create employee profile and initialize onboarding
    // Note: Manager signature is optional, so we create employee when candidate + HR sign
    this.logger.log(
      `Offer ${updated._id} signing status check - candidate: ${updated.candidateSignedAt ? 'SIGNED' : 'NOT SIGNED'}, HR: ${updated.hrSignedAt ? 'SIGNED' : 'NOT SIGNED'}, Manager: ${updated.managerSignedAt ? 'SIGNED' : 'NOT SIGNED'}`,
    );
    
    if (updated.candidateSignedAt && updated.hrSignedAt) {
      this.logger.log(
        `Both candidate and HR have signed offer ${updated._id}, triggering employee creation...`,
      );
      try {
        await this.handleOfferSigned(updated);
        this.logger.log(
          `Successfully processed employee creation for offer ${updated._id}`,
        );
      } catch (error) {
        // Log detailed error but don't fail offer signing
        this.logger.error(
          `CRITICAL: Failed to process offer signed integration for offer ${updated._id}`,
        );
        this.logger.error(
          `Error message: ${error instanceof Error ? error.message : String(error)}`,
        );
        this.logger.error(
          `Error stack: ${error instanceof Error ? error.stack : 'No stack trace available'}`,
        );
        // Log offer details for debugging
        this.logger.error(
          `Offer details - candidateId: ${updated.candidateId}, applicationId: ${updated.applicationId}`,
        );
        // Don't fail offer signing if integration fails - log and continue
      }
    }

    // Send notification if candidate signed
    if (signerType === 'candidate') {
      try {
        // Log the signing event
        this.logger.log(`Offer ${id} signed by candidate ${offer.candidateId}`);
        
        // Update application status to HIRED if offer was accepted
        if (updated.applicantResponse === OfferResponseStatus.ACCEPTED) {
          await this.applicationModel
            .findByIdAndUpdate(updated.applicationId, {
              status: ApplicationStatus.HIRED,
            })
            .exec();
        }
        // Email notification can be added here if needed
      } catch (error) {
        this.logger.error('Failed to log offer signed notification', error);
      }
    }

    return updated;
  }

  /**
   * Generate offer PDF
   * @param id - Offer ID
   * @returns PDF file data or URL
   */
  async generateOfferPDF(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.findOfferById(id);
    const candidate = await this.candidateModel.findById(offer.candidateId).exec();

    if (!candidate) {
      throw new NotFoundException('Candidate not found for offer');
    }

    const pdfUrl = await this.pdfIntegration.generateOfferPDF(offer, candidate);

    return {
      offerId: id,
      pdfUrl,
      message: 'PDF generated successfully',
    };
  }

  /**
   * Send offer to candidate
   * @param id - Offer ID
   * @returns Send confirmation
   */
  async sendOfferToCandidate(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.findOfferById(id);
    const candidate = await this.candidateModel.findById(offer.candidateId).exec();

    if (!candidate) {
      throw new NotFoundException('Candidate not found for offer');
    }

    // Generate signing token for candidate
    const signingToken = await this.generateOfferSigningToken(id, 'candidate', 7);
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5001';
    const signingUrl = `${baseUrl}/offers/${id}/sign?token=${signingToken}&signerType=candidate`;

    // Generate PDF first
    const pdfUrl = await this.pdfIntegration.generateOfferPDF(offer, candidate);

    // Send email with signing link
    await this.emailIntegration.sendOfferEmail(
      candidate.personalEmail || '',
      candidate.fullName || `${candidate.firstName} ${candidate.lastName}`,
      id,
      {
        role: offer.role,
        grossSalary: offer.grossSalary,
        signingBonus: offer.signingBonus,
        benefits: offer.benefits,
      },
      pdfUrl,
      signingUrl,
    );

    // Send notification
    await this.notificationIntegration.notifyOfferSent(
      candidate._id.toString(),
      id,
    );

    return {
      offerId: id,
      candidateId: offer.candidateId,
      sent: true,
      pdfUrl,
      signingUrl,
      message: 'Offer email sent successfully',
    };
  }

  // ============================================================================
  // SECTION 6: CONTRACT METHODS
  // ============================================================================

  /**
   * Create contract from accepted offer
   * @param createDto - Contract creation data
   * @returns Created contract document
   * @throws BadRequestException if offer ID is invalid
   */
  async createContract(
    createDto: CreateContractDto,
  ): Promise<ContractDocument> {
    if (!Types.ObjectId.isValid(createDto.offerId)) {
      throw new BadRequestException('Invalid offer ID');
    }
    if (!Types.ObjectId.isValid(createDto.documentId)) {
      throw new BadRequestException('Invalid document ID');
    }

    // Validate offer exists and is accepted
    const offer = await this.offerModel.findById(createDto.offerId).exec();
    if (!offer) {
      throw new NotFoundException(
        `Offer with ID ${createDto.offerId} not found`,
      );
    }

    if (offer.applicantResponse !== OfferResponseStatus.ACCEPTED) {
      throw new BadRequestException(
        'Cannot create contract from unaccepted offer',
      );
    }

    // Check if contract already exists
    const existingContract = await this.contractModel
      .findOne({ offerId: new Types.ObjectId(createDto.offerId) })
      .exec();

    if (existingContract) {
      throw new ConflictException('Contract already exists for this offer');
    }

    const contract = new this.contractModel({
      offerId: new Types.ObjectId(createDto.offerId),
      acceptanceDate: createDto.acceptanceDate
        ? new Date(createDto.acceptanceDate)
        : new Date(),
      grossSalary: createDto.grossSalary,
      signingBonus: createDto.signingBonus,
      role: createDto.role,
      benefits: createDto.benefits,
      documentId: new Types.ObjectId(createDto.documentId),
      employeeSignatureUrl: createDto.employeeSignatureUrl,
      employerSignatureUrl: createDto.employerSignatureUrl,
      employeeSignedAt: createDto.employeeSignedAt
        ? new Date(createDto.employeeSignedAt)
        : undefined,
      employerSignedAt: createDto.employerSignedAt
        ? new Date(createDto.employerSignedAt)
        : undefined,
    });

    const savedContract = await contract.save();

    // NOTE: Contract model is being removed - offer signing now handles employee profile creation
    // Integration: If both parties have signed, create employee profile and initialize onboarding
    // if (savedContract.employeeSignedAt && savedContract.employerSignedAt) {
    //   try {
    //     await this.handleOfferSigned(savedContract);
    //   } catch (error) {
    //     this.logger.error(
    //       `Failed to process contract signed integration for contract ${savedContract._id}:`,
    //       error instanceof Error ? error.stack : undefined,
    //     );
    //     // Don't fail contract creation if integration fails - log and continue
    //   }
    // }

    return savedContract;
  }

  /**
   * Handle offer signed - create employee profile and initialize onboarding
   * This is called automatically when both candidate and HR sign the offer
   */
  private async handleOfferSigned(offer: OfferDocument): Promise<void> {
    this.logger.log(`handleOfferSigned called for offer ${offer._id}`);
    
    // Get candidate data
    const candidate = await this.candidateModel.findById(offer.candidateId).exec();
    if (!candidate) {
      this.logger.error(`Candidate not found for offer ${offer._id}, candidateId: ${offer.candidateId}`);
      throw new NotFoundException('Candidate not found for offer');
    }

    this.logger.log(`Found candidate ${candidate._id} (${candidate.fullName || candidate.firstName} ${candidate.lastName})`);

    // Check if profile already exists by ID
    const existingProfileDoc = await this.employeeProfileModel
      .findById(candidate._id)
      .exec();

    if (existingProfileDoc) {
      this.logger.log(
        `Employee profile already exists for candidate ${candidate._id}, skipping creation but ensuring onboarding exists`,
      );
      // Still create onboarding if it doesn't exist
      const existingOnboarding = await this.onboardingModel
        .findOne({ employeeId: candidate._id, offerId: offer._id })
        .exec();
      if (!existingOnboarding) {
        this.logger.log(`Creating onboarding for existing employee ${candidate._id}`);
        await this.createOnboardingForNewEmployee(
          candidate._id.toString(),
          offer._id.toString(),
        );
      } else {
        this.logger.log(`Onboarding already exists for employee ${candidate._id} and offer ${offer._id}`);
      }
      return;
    }
    
    this.logger.log(`No existing employee profile found, creating new profile for candidate ${candidate._id}`);

    // Create employee profile from candidate
    const employeeNumber = `EMP-${Date.now()}`;
    const dateOfHire = offer.candidateSignedAt || new Date();
    const fullName = candidate.fullName || `${candidate.firstName} ${candidate.lastName}`;
    
    // Generate temporary default password: fullName with no spaces, case sensitive
    const tempPassword = fullName.replace(/\s+/g, ''); // Remove all spaces
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create employee profile from candidate data
    const employeeProfile = new this.employeeProfileModel({
      _id: candidate._id, // Use same ID as candidate to maintain reference
      employeeNumber,
      dateOfHire,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      middleName: candidate.middleName,
      fullName: fullName,
      nationalId: candidate.nationalId,
      personalEmail: candidate.personalEmail,
      password: hashedPassword, // Set temporary password based on full name (no spaces, case sensitive)
      workEmail: `${candidate.firstName}.${candidate.lastName}@company.com`.toLowerCase(),
      mobilePhone: candidate.mobilePhone,
      dateOfBirth: candidate.dateOfBirth,
      gender: candidate.gender,
      maritalStatus: candidate.maritalStatus,
      address: candidate.address,
      primaryPositionId: candidate.positionId,
      primaryDepartmentId: candidate.departmentId,
      status: EmployeeStatus.ACTIVE,
      statusEffectiveFrom: dateOfHire,
      contractStartDate: dateOfHire,
      contractType: ContractType.FULL_TIME_CONTRACT, // Default, can be updated later
    });

    try {
      await employeeProfile.save();
      this.logger.log(
        `Successfully saved employee profile ${employeeProfile._id} from candidate ${candidate._id}`,
      );
      this.logger.log(
        `Temporary default password set for employee ${fullName}: "${tempPassword}" (employee should change on first login)`,
      );
    } catch (saveError) {
      this.logger.error(
        `Failed to save employee profile for candidate ${candidate._id}: ${saveError instanceof Error ? saveError.message : String(saveError)}`,
      );
      this.logger.error(
        `Save error details: ${saveError instanceof Error ? saveError.stack : 'No stack trace'}`,
      );
      throw saveError; // Re-throw to be caught by outer try-catch
    }

    // Create onboarding automatically
    this.logger.log(`Creating onboarding for new employee ${employeeProfile._id}`);
    try {
      await this.createOnboardingForNewEmployee(
        employeeProfile._id.toString(),
        offer._id.toString(),
      );
      this.logger.log(`Successfully created onboarding for employee ${employeeProfile._id}`);
    } catch (onboardingError) {
      this.logger.error(
        `Failed to create onboarding for employee ${employeeProfile._id}: ${onboardingError instanceof Error ? onboardingError.message : String(onboardingError)}`,
      );
      // Don't throw here - employee profile was created successfully, onboarding can be retried
    }

    // Process signing bonus if applicable
    if (offer.signingBonus && offer.signingBonus > 0) {
      await this.payrollIntegration.processSigningBonus(
        employeeProfile._id.toString(),
        offer._id.toString(),
        offer.signingBonus,
      );
    }

    // Trigger payroll initiation
    await this.payrollIntegration.triggerPayrollInitiation(
      employeeProfile._id.toString(),
      dateOfHire,
    );

    this.logger.log(
      `Successfully created employee profile and initialized onboarding for employee ${employeeProfile._id}`,
    );
  }

  /**
   * Create onboarding for newly hired employee
   */
  private async createOnboardingForNewEmployee(
    employeeId: string,
    offerId: string,
  ): Promise<void> {
    // Default onboarding tasks based on department/role
    // These can be customized based on business rules
    const defaultTasks = [
      {
        name: 'Complete Employee Information Form',
        department: 'HR',
        status: 'pending' as const,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      {
        name: 'IT Access Setup',
        department: 'IT',
        status: 'pending' as const,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      },
      {
        name: 'Bank Account Information',
        department: 'Finance',
        status: 'pending' as const,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      },
      {
        name: 'Workspace Setup',
        department: 'Facilities',
        status: 'pending' as const,
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      },
      {
        name: 'Orientation Session',
        department: 'HR',
        status: 'pending' as const,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
    ];

    // Create onboarding directly with offerId (required field)
    const onboarding = new this.onboardingModel({
      employeeId: new Types.ObjectId(employeeId),
      offerId: new Types.ObjectId(offerId),
      tasks: defaultTasks.map((task) => ({
        name: task.name,
        department: task.department,
        status: task.status,
        deadline: task.deadline,
        completedAt: undefined,
        documentId: undefined,
        notes: undefined,
      })),
      completed: false,
      completedAt: undefined,
    });

    await onboarding.save();

    this.logger.log(
      `Created onboarding for employee ${employeeId} with ${defaultTasks.length} default tasks`,
    );
  }

  /**
   * Find all contracts with optional filters
   * @param filters - Optional filters
   * @returns Array of contract documents
   */
  async findAllContracts(filters?: any): Promise<ContractDocument[]> {
    const query = this.contractModel
      .find()
      .populate('offerId')
      .populate('documentId');

    if (filters?.role) {
      query.where('role').regex(new RegExp(filters.role, 'i'));
    }

    return await query.exec();
  }

  /**
   * Find contract by ID
   * @param id - Contract ID
   * @returns Contract document with populated relations
   * @throws NotFoundException if contract not found
   */
  async findContractById(id: string): Promise<ContractDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid contract ID');
    }

    const contract = await this.contractModel
      .findById(id)
      .populate('offerId')
      .populate('documentId')
      .exec();

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }
    return contract;
  }

  /**
   * Sign contract (employee/employer)
   * @param id - Contract ID
   * @param signerType - Type of signer (employee, employer)
   * @param signatureUrl - Signature URL
   * @returns Updated contract document
   * @throws NotFoundException if contract not found
   */
  /**
   * Generate signing token for contract
   * @param id - Contract ID
   * @param signerType - Type of signer (employee, employer)
   * @param expiresInDays - Token expiration in days (default: 7)
   * @returns Token string
   */
  async generateContractSigningToken(
    id: string,
    signerType: string,
    expiresInDays: number = 7,
  ): Promise<string> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid contract ID');
    }

    const contract = await this.contractModel.findById(id).exec();
    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const updateData: any = {};
    if (signerType === 'employee') {
      updateData.employeeSigningToken = token;
      updateData.employeeSigningTokenExpiresAt = expiresAt;
    } else if (signerType === 'employer') {
      updateData.employerSigningToken = token;
      updateData.employerSigningTokenExpiresAt = expiresAt;
    } else {
      throw new BadRequestException('Invalid signer type for contract');
    }

    await this.contractModel.findByIdAndUpdate(id, updateData).exec();

    return token;
  }

  /**
   * Validate contract signing token
   * @param id - Contract ID
   * @param token - Signing token
   * @param signerType - Type of signer
   * @returns Contract document if valid
   * @throws BadRequestException if token is invalid or expired
   */
  async validateContractSigningToken(
    id: string,
    token: string,
    signerType: string,
  ): Promise<ContractDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid contract ID');
    }

    const contract = await this.contractModel.findById(id).exec();
    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    let isValid = false;
    if (signerType === 'employee') {
      isValid =
        !!contract.employeeSigningToken &&
        contract.employeeSigningToken === token &&
        !!contract.employeeSigningTokenExpiresAt &&
        contract.employeeSigningTokenExpiresAt > new Date();
    } else if (signerType === 'employer') {
      isValid =
        !!contract.employerSigningToken &&
        contract.employerSigningToken === token &&
        !!contract.employerSigningTokenExpiresAt &&
        contract.employerSigningTokenExpiresAt > new Date();
    } else {
      throw new BadRequestException('Invalid signer type');
    }

    if (!isValid) {
      throw new BadRequestException('Invalid or expired signing token');
    }

    return contract;
  }

  async signContract(
    id: string,
    signerType: string,
    typedName?: string,
    ipAddress?: string,
    token?: string,
  ): Promise<ContractDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid contract ID');
    }

    const contract = await this.contractModel.findById(id).exec();
    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    // If token is provided, validate it (for public signing)
    if (token) {
      await this.validateContractSigningToken(id, token, signerType);
    }

    // Check if already signed
    if (signerType === 'employee' && contract.employeeSignedAt) {
      throw new BadRequestException('Contract already signed by employee');
    }
    if (signerType === 'employer' && contract.employerSignedAt) {
      throw new BadRequestException('Contract already signed by employer');
    }

    const updateData: any = {};
    if (signerType === 'employee') {
      updateData.employeeSignedAt = new Date();
      if (typedName) updateData.employeeTypedName = typedName;
      if (ipAddress) updateData.employeeSigningIp = ipAddress;
      // Clear token after signing
      updateData.employeeSigningToken = undefined;
      updateData.employeeSigningTokenExpiresAt = undefined;
    } else if (signerType === 'employer') {
      updateData.employerSignedAt = new Date();
      if (typedName) updateData.employerTypedName = typedName;
      if (ipAddress) updateData.employerSigningIp = ipAddress;
      // Clear token after signing
      updateData.employerSigningToken = undefined;
      updateData.employerSigningTokenExpiresAt = undefined;
    } else {
      throw new BadRequestException('Invalid signer type');
    }

    const updated = await this.contractModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    // NOTE: Contract model is being removed - offer signing now handles employee profile creation
    // Integration: If both parties have signed, create employee profile and initialize onboarding
    // if (updated.employeeSignedAt && updated.employerSignedAt) {
    //   try {
    //     await this.handleOfferSigned(updated);
    //   } catch (error) {
    //     this.logger.error(
    //       `Failed to process contract signed integration for contract ${updated._id}:`,
    //       error instanceof Error ? error.stack : undefined,
    //     );
    //     // Don't fail contract signing if integration fails - log and continue
    //   }
    // }

    return updated;
  }

  /**
   * Generate contract PDF
   * @param id - Contract ID
   * @returns PDF file data or URL
   */
  async generateContractPDF(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid contract ID');
    }

    const contract = await this.findContractById(id);
    
    // Get employee profile
    const offer = await this.offerModel
      .findById(contract.offerId)
      .populate('candidateId')
      .exec();
    
    if (!offer) {
      throw new NotFoundException('Offer not found for contract');
    }

    // Get employee profile (created from candidate)
    const employee = await this.employeeProfileModel
      .findById(offer.candidateId)
      .exec();

    if (!employee) {
      throw new NotFoundException('Employee profile not found for contract');
    }

    const pdfUrl = await this.pdfIntegration.generateContractPDF(contract, employee);

    return {
      contractId: id,
      pdfUrl,
      message: 'PDF generated successfully',
    };
  }

  /**
   * Get contract by offer ID
   * @param offerId - Offer ID
   * @returns Contract document or null
   */
  async getContractByOfferId(
    offerId: string,
  ): Promise<ContractDocument | null> {
    if (!Types.ObjectId.isValid(offerId)) {
      throw new BadRequestException('Invalid offer ID');
    }

    return await this.contractModel
      .findOne({ offerId: new Types.ObjectId(offerId) })
      .populate('offerId')
      .populate('documentId')
      .exec();
  }

  // ============================================================================
  // SECTION 7: ONBOARDING METHODS
  // ============================================================================

  /**
   * Initialize onboarding process
   * @param createDto - Onboarding creation data
   * @returns Created onboarding document
   * @throws BadRequestException if employee ID is invalid
   */
  async createOnboarding(
    createDto: CreateOnboardingDto,
  ): Promise<OnboardingDocument> {
    if (!Types.ObjectId.isValid(createDto.employeeId)) {
      throw new BadRequestException('Invalid employee ID');
    }

    // Check if onboarding already exists
    const existing = await this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(createDto.employeeId) })
      .exec();

    if (existing) {
      throw new ConflictException(
        'Onboarding already exists for this employee',
      );
    }

    const onboarding = new this.onboardingModel({
      employeeId: new Types.ObjectId(createDto.employeeId),
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
              ? new Types.ObjectId(task.documentId)
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

  /**
   * Find all onboarding records with optional filters
   * @param filters - Optional filters for status, department, date range
   * @returns Array of onboarding documents with populated employee information
   */
  async findAllOnboardings(filters?: {
    status?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<OnboardingDocument[]> {
    const query: any = {};

    // Filter by completion status
    if (filters?.status) {
      if (filters.status === 'completed') {
        query.completed = true;
      } else if (filters.status === 'pending') {
        query.completed = false;
      }
    }

    // Filter by date range (based on createdAt)
    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    // Get all onboarding records with populated employee and offer information
    let onboardings = await this.onboardingModel
      .find(query)
      .populate('offerId', 'role grossSalary')
      .populate({
        path: 'employeeId',
        select: 'firstName lastName fullName primaryDepartmentId workEmail employeeNumber',
        populate: {
          path: 'primaryDepartmentId',
          select: 'name code',
        },
      })
      .sort({ createdAt: -1 })
      .exec();

    // Filter by department if specified (after population)
    if (filters?.department) {
      onboardings = onboardings.filter((onboarding: any) => {
        const employee = onboarding.employeeId;
        if (!employee || !employee.primaryDepartmentId) return false;
        const deptId = typeof employee.primaryDepartmentId === 'object'
          ? employee.primaryDepartmentId._id?.toString()
          : employee.primaryDepartmentId?.toString();
        return deptId === filters.department;
      });
    }

    return onboardings;
  }

  /**
   * Find onboarding by ID
   * @param id - Onboarding ID
   * @returns Onboarding document or null
   */
  async findOnboardingById(id: string): Promise<OnboardingDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid onboarding ID');
    }

    return await this.onboardingModel
      .findById(id)
      .populate('offerId', 'role grossSalary')
      .populate({
        path: 'employeeId',
        select: 'firstName lastName fullName primaryDepartmentId workEmail employeeNumber',
        populate: {
          path: 'primaryDepartmentId',
          select: 'name code',
        },
      })
      .populate('tasks.documentId')
      .exec();
  }

  /**
   * Find onboarding by employee ID
   * @param employeeId - Employee ID
   * @returns Onboarding document or null
   */
  async findOnboardingByEmployeeId(
    employeeId: string,
  ): Promise<OnboardingDocument | null> {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee ID');
    }

    return await this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .populate('tasks.documentId')
      .exec();
  }

  /**
   * Update onboarding task
   * @param id - Onboarding ID
   * @param taskId - Task ID (index in tasks array)
   * @param updateDto - Task update data
   * @returns Updated onboarding document
   * @throws NotFoundException if onboarding or task not found
   */
  async updateOnboardingTask(
    id: string,
    taskId: string,
    updateDto: UpdateOnboardingTaskDto,
  ): Promise<OnboardingDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid onboarding ID');
    }

    const onboarding = await this.onboardingModel.findById(id).exec();
    if (!onboarding) {
      throw new NotFoundException(`Onboarding with ID ${id} not found`);
    }

    const taskIndex = parseInt(taskId, 10);
    if (isNaN(taskIndex) || taskIndex < 0 || taskIndex >= onboarding.tasks.length) {
      throw new NotFoundException(`Task with index ${taskId} not found`);
    }

    const task = onboarding.tasks[taskIndex];
    if (updateDto.status) {
      task.status = updateDto.status;
    }
    if (updateDto.completedAt) {
      task.completedAt = new Date(updateDto.completedAt);
    }
    if (updateDto.documentId) {
      task.documentId = new Types.ObjectId(updateDto.documentId);
    }
    if (updateDto.notes !== undefined) {
      task.notes = updateDto.notes;
    }

    const updated = await onboarding.save();

    // Check if all tasks are completed and mark onboarding as complete
    if (updated.tasks.length > 0 && updated.tasks.every((t: any) => t.status === OnboardingTaskStatus.COMPLETED)) {
      if (!updated.completed) {
        updated.completed = true;
        updated.completedAt = new Date();
        await updated.save();
        this.logger.log(`Onboarding ${id} marked as complete - all tasks completed`);
      }
    }

    return updated;
  }

  /**
   * Mark onboarding as complete
   * @param id - Onboarding ID
   * @returns Updated onboarding document
   * @throws NotFoundException if onboarding not found
   */
  async completeOnboarding(id: string): Promise<OnboardingDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid onboarding ID');
    }

    const onboarding = await this.onboardingModel.findById(id).exec();
    if (!onboarding) {
      throw new NotFoundException(`Onboarding with ID ${id} not found`);
    }

    onboarding.completed = true;
    onboarding.completedAt = new Date();

    return await onboarding.save();
  }

  /**
   * Get all onboarding tasks
   * @param id - Onboarding ID
   * @returns Array of onboarding tasks
   */
  async getOnboardingTasks(id: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid onboarding ID');
    }

    const onboarding = await this.onboardingModel
      .findById(id)
      .populate('tasks.documentId')
      .exec();

    if (!onboarding) {
      throw new NotFoundException(`Onboarding with ID ${id} not found`);
    }

    return onboarding.tasks;
  }

  // ============================================================================
  // SECTION 8: TERMINATION METHODS
  // ============================================================================

  /**
   * Create termination request and initiate offboarding workflow (OFF-001)
   * Automatically creates clearance checklist with default departments (OFF-006)
   * @param createDto - Termination request creation data
   * @returns Created termination request document
   * @throws BadRequestException if employee or offer ID is invalid
   */
  async createTerminationRequest(
    createDto: CreateTerminationRequestDto,
  ): Promise<TerminationRequestDocument> {
    if (!Types.ObjectId.isValid(createDto.employeeId)) {
      throw new BadRequestException('Invalid employee ID');
    }

    // Find offerId if not provided - look for employee's onboarding record or offer
    // Verify employee exists first (we need it for lookup)
    const employee = await this.employeeProfileModel
      .findById(createDto.employeeId)
      .lean()
      .exec();
    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    let offerId = createDto.offerId;
    if (!offerId) {
      // Method 1: Try to find offer through onboarding record
      const onboarding = await this.onboardingModel
        .findOne({ employeeId: new Types.ObjectId(createDto.employeeId) })
        .sort({ createdAt: -1 }) // Get most recent onboarding
        .exec();
      
      if (onboarding) {
        offerId = onboarding.offerId.toString();
        this.logger.log(`Found offer ${offerId} from onboarding for employee ${createDto.employeeId}`);
      } else {
        // Method 2: Try to find offer by candidateId (if employee ID matches candidate ID)
        // This works when employee profile was created directly from candidate (same _id)
        let offer = await this.offerModel
          .findOne({ candidateId: new Types.ObjectId(createDto.employeeId) })
          .sort({ createdAt: -1 }) // Get most recent offer
          .exec();
        
        if (offer) {
          offerId = offer._id.toString();
          this.logger.log(`Found offer ${offerId} by candidateId for employee ${createDto.employeeId}`);
        } else {
          // Method 3: Try to find offer through candidate email match -> application -> offer
          const employeeEmail = (employee as any).workEmail || (employee as any).personalEmail;
          
          if (employeeEmail) {
            // Find candidate by email (Candidate extends UserProfileBase which has personalEmail)
            // Check both personalEmail and workEmail (if candidate has workEmail)
            const candidate = await this.candidateModel
              .findOne({
                $or: [
                  { personalEmail: employeeEmail },
                  { workEmail: employeeEmail },
                ],
              })
              .sort({ createdAt: -1 })
              .exec();
            
            if (candidate) {
              // Find application by candidateId
              const application = await this.applicationModel
                .findOne({ candidateId: candidate._id })
                .sort({ createdAt: -1 })
                .exec();
              
              if (application) {
                // Find offer by applicationId
                offer = await this.offerModel
                  .findOne({ applicationId: application._id })
                  .sort({ createdAt: -1 })
                  .exec();
                
                if (offer) {
                  offerId = offer._id.toString();
                  this.logger.log(`Found offer ${offerId} through candidate email match for employee ${createDto.employeeId}`);
                }
              }
            }
          }
          
          // If still no offer found, throw helpful error
          if (!offerId) {
            this.logger.warn(`Could not find offer for employee ${createDto.employeeId}. Attempted: onboarding record, candidateId match, and candidate email lookup.`);
            throw new BadRequestException(
              'Offer ID is required. Cannot find associated offer for this employee. ' +
              'This employee may not have gone through the recruitment process, or the offer link may be missing. ' +
              'Please provide offerId manually or contact system administrator.'
            );
          }
        }
      }
    }

    if (!Types.ObjectId.isValid(offerId)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const termination = new this.terminationRequestModel({
      employeeId: new Types.ObjectId(createDto.employeeId),
      initiator: createDto.initiator,
      reason: createDto.reason,
      employeeComments: createDto.employeeComments,
      hrComments: createDto.hrComments,
      terminationDate: createDto.terminationDate
        ? new Date(createDto.terminationDate)
        : undefined,
      offerId: new Types.ObjectId(offerId),
      status: TerminationStatus.PENDING,
    });

    const savedTermination = await termination.save();
    this.logger.log(`Created termination request ${savedTermination._id} for employee ${createDto.employeeId}`);

    // OFF-006: Automatically create and activate clearance checklist with default departments
    try {
      await this.initializeClearanceChecklist(savedTermination._id.toString());
      this.logger.log(`Initialized clearance checklist for termination ${savedTermination._id}`);
    } catch (error) {
      this.logger.error(
        `Failed to initialize clearance checklist for termination ${savedTermination._id}:`,
        error instanceof Error ? error.stack : undefined,
      );
      // Don't fail termination creation if checklist initialization fails - log and continue
    }

    return savedTermination;
  }

  /**
   * Initialize clearance checklist with default departments (OFF-006, OFF-010)
   * Creates checklist with pending items for IT, Finance, Facilities, and Line Manager
   */
  private async initializeClearanceChecklist(terminationId: string): Promise<ClearanceChecklistDocument> {
    const existingChecklist = await this.clearanceChecklistModel
      .findOne({ terminationId: new Types.ObjectId(terminationId) })
      .exec();

    if (existingChecklist) {
      this.logger.log(`Clearance checklist already exists for termination ${terminationId}`);
      return existingChecklist;
    }

    // Default departments for clearance (OFF-010)
    const defaultDepartments = [
      { department: 'IT', status: ApprovalStatus.PENDING },
      { department: 'Finance', status: ApprovalStatus.PENDING },
      { department: 'Facilities', status: ApprovalStatus.PENDING },
      { department: 'Line Manager', status: ApprovalStatus.PENDING },
    ];

    const checklist = new this.clearanceChecklistModel({
      terminationId: new Types.ObjectId(terminationId),
      items: defaultDepartments.map(dept => ({
        department: dept.department,
        status: dept.status,
        comments: undefined,
        updatedBy: undefined,
        updatedAt: undefined,
      })),
      equipmentList: [],
      cardReturned: false,
    });

    return await checklist.save();
  }

  /**
   * Find all termination requests with optional filters
   * @param filters - Optional filters (status, employeeId, etc.)
   * @returns Array of termination request documents
   */
  async findAllTerminationRequests(
    filters?: any,
  ): Promise<TerminationRequestDocument[]> {
    const query = this.terminationRequestModel
      .find()
      .populate({
        path: 'employeeId',
        select: 'firstName lastName fullName primaryDepartmentId workEmail employeeNumber',
        populate: {
          path: 'primaryDepartmentId',
          select: 'name code',
        },
      })
      .populate('offerId');

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

  /**
   * Find termination request by ID
   * @param id - Termination request ID
   * @returns Termination request document with populated relations
   * @throws NotFoundException if termination request not found
   */
  async findTerminationRequestById(
    id: string,
  ): Promise<TerminationRequestDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid termination request ID');
    }

    const termination = await this.terminationRequestModel
      .findById(id)
      .populate({
        path: 'employeeId',
        select: 'firstName lastName fullName primaryDepartmentId workEmail employeeNumber',
        populate: {
          path: 'primaryDepartmentId',
          select: 'name code',
        },
      })
      .populate('offerId')
      .exec();

    if (!termination) {
      throw new NotFoundException(
        `Termination request with ID ${id} not found`,
      );
    }
    return termination;
  }

  /**
   * Update termination status
   * @param id - Termination request ID
   * @param status - New termination status
   * @param hrAdminId - HR Admin ID who is updating the status (for audit trail)
   * @returns Updated termination request document
   * @throws NotFoundException if termination request not found
   */
  async updateTerminationStatus(
    id: string,
    status: TerminationStatus,
    hrAdminId?: string,
  ): Promise<TerminationRequestDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid termination request ID');
    }

    const termination = await this.terminationRequestModel
      .findById(id)
      .exec();

    if (!termination) {
      throw new NotFoundException(
        `Termination request with ID ${id} not found`,
      );
    }

    const previousStatus = termination.status;

    // Update termination status
    termination.status = status;
    const updatedTermination = await termination.save();

    // Integration: If termination is approved, trigger employee status update workflow
    if (
      status === TerminationStatus.APPROVED &&
      previousStatus !== TerminationStatus.APPROVED
    ) {
      try {
        await this.handleTerminationApproved(termination, hrAdminId);
      } catch (error) {
        this.logger.error(
          `Failed to process termination approved integration for termination ${id}:`,
          error instanceof Error ? error.stack : undefined,
        );
        // Don't fail status update if integration fails - log and continue
      }
    }

    return updatedTermination;
  }

  /**
   * Handle termination approved - update employee status and process final settlements
   * US-EP-05: Deactivate employee profile upon termination/resignation by setting status
   * Automatically sets Current Status field based on termination reason
   */
  private async handleTerminationApproved(
    termination: TerminationRequestDocument,
    hrAdminId?: string,
  ): Promise<void> {
    const employeeId = termination.employeeId.toString();
    const terminationDate = termination.terminationDate || new Date();

    this.logger.log(
      `Processing termination approved for employee ${employeeId}`,
    );

    // 1. Update employee status based on termination reason (US-EP-05)
    // Map termination reason to EmployeeStatus - automatically sets Current Status field
    let employeeStatus: EmployeeStatus = EmployeeStatus.TERMINATED;
    const reasonLower = termination.reason.toLowerCase();
    if (reasonLower.includes('retirement') || reasonLower.includes('retired')) {
      employeeStatus = EmployeeStatus.RETIRED;
    } else if (reasonLower.includes('resignation') || reasonLower.includes('resigned')) {
      // Resignations are typically marked as TERMINATED
      employeeStatus = EmployeeStatus.TERMINATED;
    } else {
      // Default to TERMINATED for terminations
      employeeStatus = EmployeeStatus.TERMINATED;
    }

    try {
      // Update employee status instead of deleting (soft deactivate)
      // Use employeeId as fallback if hrAdminId not provided (for system-initiated updates)
      const adminId = hrAdminId || employeeId;
      await this.employeeProfileService.hrUpdateEmployeeProfile(
        employeeId,
        adminId,
        {
          status: employeeStatus,
          statusEffectiveFrom: terminationDate,
          changeReason: `Termination approved: ${termination.reason}`,
        },
      );
      this.logger.log(
        `Updated employee ${employeeId} status to ${employeeStatus} (termination approved)`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update employee status for ${employeeId}:`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error; // Re-throw as this is critical
    }

    // 2. Process final leave settlement
    try {
      await this.leavesIntegration.processFinalLeaveSettlement(
        employeeId,
        terminationDate,
      );
    } catch (error) {
      this.logger.warn(
        `Could not process leave settlement for ${employeeId}:`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    // 3. Process final payroll (termination benefits)
    try {
      await this.payrollIntegration.processTerminationBenefits(
        employeeId,
        terminationDate,
      );
    } catch (error) {
      this.logger.warn(
        `Could not process termination benefits for ${employeeId}:`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    this.logger.log(
      `Successfully processed termination approved workflow for employee ${employeeId}`,
    );
  }

  /**
   * Get clearance checklist for termination
   * Automatically initializes checklist if it doesn't exist (lazy initialization)
   * @param id - Termination request ID
   * @returns Clearance checklist document
   */
  async getClearanceChecklist(
    id: string,
  ): Promise<ClearanceChecklistDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid termination request ID');
    }

    // Validate termination exists
    const termination = await this.terminationRequestModel
      .findById(id)
      .exec();
    if (!termination) {
      throw new NotFoundException(
        `Termination request with ID ${id} not found`,
      );
    }

    // Try to find existing checklist
    let checklist = await this.clearanceChecklistModel
      .findOne({ terminationId: new Types.ObjectId(id) })
      .populate('items.updatedBy')
      .exec();

    // If checklist doesn't exist, initialize it (lazy initialization)
    if (!checklist) {
      this.logger.log(`Clearance checklist not found for termination ${id}, initializing...`);
      try {
        checklist = await this.initializeClearanceChecklist(id);
        this.logger.log(`Successfully initialized clearance checklist for termination ${id}`);
      } catch (error) {
        this.logger.error(
          `Failed to initialize clearance checklist for termination ${id}:`,
          error instanceof Error ? error.stack : undefined,
        );
        throw new BadRequestException(
          `Failed to initialize clearance checklist: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    return checklist;
  }

  /**
   * Update clearance checklist
   * @param id - Termination request ID
   * @param updateDto - Clearance checklist update data
   * @returns Updated or created clearance checklist document
   */
  async updateClearanceChecklist(
    id: string,
    updateDto: UpdateClearanceChecklistDto,
  ): Promise<ClearanceChecklistDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid termination request ID');
    }

    // Validate termination exists
    const termination = await this.terminationRequestModel
      .findById(id)
      .exec();
    if (!termination) {
      throw new NotFoundException(
        `Termination request with ID ${id} not found`,
      );
    }

    let checklist = await this.clearanceChecklistModel
      .findOne({ terminationId: new Types.ObjectId(id) })
      .exec();

    if (!checklist) {
      // Create new checklist
      checklist = new this.clearanceChecklistModel({
        terminationId: new Types.ObjectId(id),
        items: updateDto.items
          ? updateDto.items.map((item) => ({
              department: item.department,
              status: item.status || ApprovalStatus.PENDING,
              comments: item.comments,
              updatedBy: item.updatedBy
                ? new Types.ObjectId(item.updatedBy)
                : undefined,
              updatedAt: new Date(),
            }))
          : [],
        equipmentList: updateDto.equipmentList
          ? updateDto.equipmentList.map((equipment) => ({
              equipmentId: equipment.equipmentId
                ? new Types.ObjectId(equipment.equipmentId)
                : undefined,
              name: equipment.name,
              returned: equipment.returned || false,
              condition: equipment.condition,
            }))
          : [],
        cardReturned: updateDto.cardReturned || false,
      });
    } else {
      // Update existing checklist
      if (updateDto.items) {
        checklist.items = updateDto.items.map((item) => ({
          department: item.department,
          status: item.status || ApprovalStatus.PENDING,
          comments: item.comments,
          updatedBy: item.updatedBy
            ? new Types.ObjectId(item.updatedBy)
            : undefined,
          updatedAt: new Date(),
        }));
      }
      if (updateDto.equipmentList) {
        checklist.equipmentList = updateDto.equipmentList.map((equipment) => ({
          equipmentId: equipment.equipmentId
            ? new Types.ObjectId(equipment.equipmentId)
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

  /**
   * OFF-007: Revoke system and account access for terminated employee
   * System Admin can revoke all roles and permissions
   * @param terminationId - Termination request ID
   * @param systemAdminId - System Admin ID who is revoking access
   * @param revokeDto - Revoke access data
   * @returns Result of access revocation
   */
  async revokeSystemAccess(
    terminationId: string,
    systemAdminId: string,
    revokeDto: RevokeAccessDto,
  ): Promise<{
    message: string;
    employeeId: string;
    rolesRevoked: boolean;
    permissionsRevoked: boolean;
  }> {
    if (!Types.ObjectId.isValid(terminationId)) {
      throw new BadRequestException('Invalid termination request ID');
    }
    if (!Types.ObjectId.isValid(systemAdminId)) {
      throw new BadRequestException('Invalid system admin ID');
    }

    // Validate termination exists
    const termination = await this.terminationRequestModel
      .findById(terminationId)
      .populate('employeeId')
      .exec();

    if (!termination) {
      throw new NotFoundException(
        `Termination request with ID ${terminationId} not found`,
      );
    }

    const employeeId = termination.employeeId.toString();

    // Get current employee roles
    const employeeRoles = await this.employeeProfileService.getEmployeeRoles(
      employeeId,
    );

    // Revoke all roles by setting isActive to false
    const revokeAllRoles = revokeDto.revokeAllRoles ?? true;
    const revokeAllPermissions = revokeDto.revokeAllPermissions ?? true;

    if (revokeAllRoles || revokeAllPermissions) {
      await this.employeeProfileService.assignRoles(
        employeeId,
        systemAdminId,
        {
          roles: revokeAllRoles ? [] : employeeRoles.roles,
          permissions: revokeAllPermissions ? [] : employeeRoles.permissions,
          isActive: false,
          reason: revokeDto.reason || 'Access revoked due to termination/offboarding',
        },
      );
    }

    // Update clearance checklist - mark IT/System Admin department as approved
    const checklist = await this.clearanceChecklistModel
      .findOne({ terminationId: new Types.ObjectId(terminationId) })
      .exec();

    if (checklist) {
      const itItem = checklist.items.find((item) => item.department === 'IT');
      if (itItem) {
        itItem.status = ApprovalStatus.APPROVED;
        itItem.comments = revokeDto.reason || 'System access revoked';
        itItem.updatedBy = new Types.ObjectId(systemAdminId);
        itItem.updatedAt = new Date();
      }
      await checklist.save();
    }

    this.logger.log(
      `System access revoked for employee ${employeeId} by system admin ${systemAdminId}`,
    );

    return {
      message: 'System and account access revoked successfully',
      employeeId,
      rolesRevoked: revokeAllRoles,
      permissionsRevoked: revokeAllPermissions,
    };
  }

  /**
   * OFF-013: Trigger final settlement for terminated employee
   * HR Manager can trigger final settlement including leave balance, benefits termination, and final payroll
   * @param terminationId - Termination request ID
   * @param hrManagerId - HR Manager ID who is triggering settlement
   * @param settlementDto - Final settlement data
   * @returns Result of final settlement processing
   */
  async triggerFinalSettlement(
    terminationId: string,
    hrManagerId: string,
    settlementDto: TriggerFinalSettlementDto,
  ): Promise<{
    message: string;
    employeeId: string;
    terminationDate: Date;
    leaveSettlementProcessed: boolean;
    terminationBenefitsProcessed: boolean;
    benefitsTerminated: boolean;
  }> {
    if (!Types.ObjectId.isValid(terminationId)) {
      throw new BadRequestException('Invalid termination request ID');
    }
    if (!Types.ObjectId.isValid(hrManagerId)) {
      throw new BadRequestException('Invalid HR manager ID');
    }

    // Validate termination exists and is approved
    const termination = await this.terminationRequestModel
      .findById(terminationId)
      .populate('employeeId')
      .exec();

    if (!termination) {
      throw new NotFoundException(
        `Termination request with ID ${terminationId} not found`,
      );
    }

    if (termination.status !== TerminationStatus.APPROVED) {
      throw new BadRequestException(
        'Termination request must be approved before final settlement can be triggered',
      );
    }

    const employeeId = termination.employeeId.toString();
    const terminationDate =
      settlementDto.effectiveDate
        ? new Date(settlementDto.effectiveDate)
        : termination.terminationDate || new Date();

    const processLeaveSettlement =
      settlementDto.processLeaveSettlement ?? true;
    const processTerminationBenefits =
      settlementDto.processTerminationBenefits ?? true;
    const terminateBenefits = settlementDto.terminateBenefits ?? true;

    let leaveSettlementProcessed = false;
    let terminationBenefitsProcessed = false;
    let benefitsTerminated = false;

    // 1. Process final leave settlement
    if (processLeaveSettlement) {
      try {
        await this.leavesIntegration.processFinalLeaveSettlement(
          employeeId,
          terminationDate,
        );
        leaveSettlementProcessed = true;
        this.logger.log(
          `Final leave settlement processed for employee ${employeeId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to process final leave settlement for employee ${employeeId}:`,
          error instanceof Error ? error.stack : undefined,
        );
        // Continue with other settlement steps even if leave settlement fails
      }
    }

    // 2. Process termination benefits (final payroll calculation)
    if (processTerminationBenefits) {
      try {
        await this.payrollIntegration.processTerminationBenefits(
          employeeId,
          terminationDate,
        );
        terminationBenefitsProcessed = true;
        this.logger.log(
          `Termination benefits processed for employee ${employeeId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to process termination benefits for employee ${employeeId}:`,
          error instanceof Error ? error.stack : undefined,
        );
        // Continue with other settlement steps even if benefits processing fails
      }
    }

    // 3. Terminate benefits (update employee status to ensure benefits are stopped)
    if (terminateBenefits) {
      try {
        // Benefits termination is typically handled by updating employee status
        // which we already do in handleTerminationApproved, but we can log it here
        this.logger.log(
          `Benefits termination processed for employee ${employeeId}`,
        );
        benefitsTerminated = true;
      } catch (error) {
        this.logger.error(
          `Failed to terminate benefits for employee ${employeeId}:`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    // Update clearance checklist - mark Finance department as approved
    const checklist = await this.clearanceChecklistModel
      .findOne({ terminationId: new Types.ObjectId(terminationId) })
      .exec();

    if (checklist) {
      const financeItem = checklist.items.find(
        (item) => item.department === 'Finance',
      );
      if (financeItem) {
        financeItem.status = ApprovalStatus.APPROVED;
        financeItem.comments =
          settlementDto.comments || 'Final settlement processed';
        financeItem.updatedBy = new Types.ObjectId(hrManagerId);
        financeItem.updatedAt = new Date();
      }
      await checklist.save();
    }

    this.logger.log(
      `Final settlement triggered for employee ${employeeId} by HR manager ${hrManagerId}`,
    );

    return {
      message: 'Final settlement processed successfully',
      employeeId,
      terminationDate,
      leaveSettlementProcessed,
      terminationBenefitsProcessed,
      benefitsTerminated,
    };
  }

  // ============================================================================
  // SECTION 9: REFERRAL METHODS
  // ============================================================================

  /**
   * Create employee referral
   * @param createDto - Referral creation data
   * @returns Created referral document
   * @throws BadRequestException if employee or candidate ID is invalid
   */
  async createReferral(createDto: CreateReferralDto): Promise<ReferralDocument> {
    if (!Types.ObjectId.isValid(createDto.referringEmployeeId)) {
      throw new BadRequestException('Invalid referring employee ID');
    }
    if (!Types.ObjectId.isValid(createDto.candidateId)) {
      throw new BadRequestException('Invalid candidate ID');
    }

    const referral = new this.referralModel({
      referringEmployeeId: new Types.ObjectId(createDto.referringEmployeeId),
      candidateId: new Types.ObjectId(createDto.candidateId),
      role: createDto.role,
      level: createDto.level,
    });

    return await referral.save();
  }

  /**
   * Find all referrals with optional filters
   * @param filters - Optional filters (referringEmployeeId, candidateId, etc.)
   * @returns Array of referral documents
   */
  async findAllReferrals(filters?: any): Promise<ReferralDocument[]> {
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

  /**
   * Find referral by ID
   * @param id - Referral ID
   * @returns Referral document
   * @throws NotFoundException if referral not found
   */
  async findReferralById(id: string): Promise<ReferralDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid referral ID');
    }

    const referral = await this.referralModel
      .findById(id)
      .populate('referringEmployeeId')
      .populate('candidateId')
      .exec();

    if (!referral) {
      throw new NotFoundException(`Referral with ID ${id} not found`);
    }
    return referral;
  }

  /**
   * Update referral
   * @param id - Referral ID
   * @param updateDto - Update data
   * @returns Updated referral document
   * @throws NotFoundException if referral not found
   */
  async updateReferral(id: string, updateDto: any): Promise<ReferralDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid referral ID');
    }

    const updateData: any = {};
    if (updateDto.referringEmployeeId) {
      if (!Types.ObjectId.isValid(updateDto.referringEmployeeId)) {
        throw new BadRequestException('Invalid referring employee ID');
      }
      updateData.referringEmployeeId = new Types.ObjectId(updateDto.referringEmployeeId);
    }
    if (updateDto.candidateId) {
      if (!Types.ObjectId.isValid(updateDto.candidateId)) {
        throw new BadRequestException('Invalid candidate ID');
      }
      updateData.candidateId = new Types.ObjectId(updateDto.candidateId);
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
      throw new NotFoundException(`Referral with ID ${id} not found`);
    }
    return referral;
  }

  /**
   * Delete referral
   * @param id - Referral ID
   * @throws NotFoundException if referral not found
   */
  async deleteReferral(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid referral ID');
    }

    const referral = await this.referralModel.findByIdAndDelete(id).exec();
    if (!referral) {
      throw new NotFoundException(`Referral with ID ${id} not found`);
    }
  }

  // ============================================================================
  // SECTION 10: DOCUMENT METHODS
  // ============================================================================

  /**
   * Create document record
   * @param createDto - Document creation data (includes filePath, fileName, fileSize from upload)
   * @returns Created document document
   */
  async createDocument(
    createDto: CreateDocumentDto & {
      filePath: string;
      fileName: string;
      fileSize: number;
    },
  ): Promise<DocumentDocument> {
    // Ensure filePath is relative to project root for consistency
    const filePath = createDto.filePath.startsWith('./')
      ? createDto.filePath
      : `./${createDto.filePath}`;

    const document = new this.documentModel({
      ownerId: createDto.ownerId
        ? new Types.ObjectId(createDto.ownerId)
        : undefined,
      type: createDto.type,
      filePath: filePath,
      uploadedAt: new Date(),
      entityType: createDto.entityType,
      entityId: createDto.entityId
        ? new Types.ObjectId(createDto.entityId)
        : undefined,
    });

    return await document.save();
  }

  /**
   * Find all documents with optional filters
   * @param filters - Optional filters (entityType, entityId, documentType, etc.)
   * @returns Array of document documents
   */
  async findAllDocuments(filters?: any): Promise<DocumentDocument[]> {
    const query = this.documentModel.find().populate('ownerId');

    if (filters?.entityType) {
      query.where('entityType').equals(filters.entityType);
    }
    if (filters?.entityId) {
      if (Types.ObjectId.isValid(filters.entityId)) {
        query.where('entityId').equals(new Types.ObjectId(filters.entityId));
      }
    }
    if (filters?.documentType) {
      query.where('type').equals(filters.documentType);
    }
    if (filters?.ownerId) {
      if (Types.ObjectId.isValid(filters.ownerId)) {
        query.where('ownerId').equals(new Types.ObjectId(filters.ownerId));
      }
    }

    return await query.exec();
  }

  /**
   * Find document by ID
   * @param id - Document ID
   * @returns Document document
   * @throws NotFoundException if document not found
   */
  async findDocumentById(id: string): Promise<DocumentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid document ID');
    }

    const document = await this.documentModel
      .findById(id)
      .populate('ownerId')
      .exec();

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  /**
   * Update document
   * @param id - Document ID
   * @param updateDto - Update data
   * @returns Updated document document
   * @throws NotFoundException if document not found
   */
  async updateDocument(id: string, updateDto: UpdateDocumentDto): Promise<DocumentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid document ID');
    }

    const updateData: any = {};
    if (updateDto.type) {
      updateData.type = updateDto.type;
    }
    if (updateDto.ownerId) {
      if (!Types.ObjectId.isValid(updateDto.ownerId)) {
        throw new BadRequestException('Invalid owner ID');
      }
      updateData.ownerId = new Types.ObjectId(updateDto.ownerId);
    }

    const document = await this.documentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('ownerId')
      .exec();

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  /**
   * Delete document
   * @param id - Document ID
   * @throws NotFoundException if document not found
   * @note This only deletes the database record, not the actual file
   */
  async deleteDocument(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid document ID');
    }

    const document = await this.documentModel.findByIdAndDelete(id).exec();
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // TODO: Delete the actual file from storage
  }

  /**
   * Download document
   * @param id - Document ID
   * @returns Document file data or download URL
   * @note This is a placeholder - file serving would be implemented here
   */
  async downloadDocument(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid document ID');
    }

    const document = await this.findDocumentById(id);

    // TODO: Implement file serving
    // This would read the file from storage and return it as a stream or URL
    return {
      documentId: id,
      filePath: document.filePath,
      downloadUrl: `/documents/${id}/download`,
      message: 'File download not yet implemented',
    };
  }

  // ============================================================================
  // SECTION 11: DASHBOARD & REPORTING METHODS
  // ============================================================================

  /**
   * Get recruitment overview statistics
   * @param filters - Optional filters (date range, department, etc.)
   * @returns Overview statistics
   */
  async getRecruitmentOverview(filters?: any): Promise<any> {
    const totalRequisitions = await this.jobRequisitionModel.countDocuments().exec();
    const openRequisitions = await this.jobRequisitionModel
      .countDocuments({ publishStatus: 'published' })
      .exec();
    const totalApplications = await this.applicationModel.countDocuments().exec();
    const activeApplications = await this.applicationModel
      .countDocuments({ status: ApplicationStatus.IN_PROCESS })
      .exec();
    const totalOffers = await this.offerModel.countDocuments().exec();
    const pendingOffers = await this.offerModel
      .countDocuments({ applicantResponse: OfferResponseStatus.PENDING })
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
          .countDocuments({ status: ApplicationStatus.HIRED })
          .exec(),
        rejected: await this.applicationModel
          .countDocuments({ status: ApplicationStatus.REJECTED })
          .exec(),
      },
      offers: {
        total: totalOffers,
        pending: pendingOffers,
        accepted: await this.offerModel
          .countDocuments({ applicantResponse: OfferResponseStatus.ACCEPTED })
          .exec(),
        rejected: await this.offerModel
          .countDocuments({ applicantResponse: OfferResponseStatus.REJECTED })
          .exec(),
      },
    };
  }

  /**
   * Get recruitment metrics
   * @param filters - Optional filters
   * @returns Detailed recruitment metrics
   */
  async getRecruitmentMetrics(filters?: any): Promise<any> {
    const overview = await this.getRecruitmentOverview(filters);

    // Calculate additional metrics
    const interviews = await this.interviewModel.countDocuments().exec();
    const completedInterviews = await this.interviewModel
      .countDocuments({ status: InterviewStatus.COMPLETED })
      .exec();

    return {
      ...overview,
      interviews: {
        total: interviews,
        completed: completedInterviews,
        scheduled: await this.interviewModel
          .countDocuments({ status: InterviewStatus.SCHEDULED })
          .exec(),
        cancelled: await this.interviewModel
          .countDocuments({ status: InterviewStatus.CANCELLED })
          .exec(),
      },
      timeToHire: await this.getTimeToHireMetrics(),
    };
  }

  /**
   * Get pipeline view (applications by stage)
   * @param filters - Optional filters (requisitionId, etc.)
   * @returns Pipeline data grouped by stage
   */
  async getPipelineView(filters?: any): Promise<any> {
    const query: any = {};
    if (filters?.requisitionId) {
      query.requisitionId = new Types.ObjectId(filters.requisitionId);
    }

    const pipeline = {
      screening: await this.applicationModel
        .countDocuments({ ...query, currentStage: ApplicationStage.SCREENING })
        .exec(),
      departmentInterview: await this.applicationModel
        .countDocuments({
          ...query,
          currentStage: ApplicationStage.DEPARTMENT_INTERVIEW,
        })
        .exec(),
      hrInterview: await this.applicationModel
        .countDocuments({
          ...query,
          currentStage: ApplicationStage.HR_INTERVIEW,
        })
        .exec(),
      offer: await this.applicationModel
        .countDocuments({ ...query, currentStage: ApplicationStage.OFFER })
        .exec(),
    };

    return pipeline;
  }

  /**
   * Get requisition-specific metrics
   * @param id - Requisition ID
   * @returns Metrics for the specific requisition
   */
  async getRequisitionMetrics(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid requisition ID');
    }

    const requisition = await this.findJobRequisitionById(id);

    const totalApplications = await this.applicationModel
      .countDocuments({ requisitionId: new Types.ObjectId(id) })
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

  /**
   * Get applications grouped by stage
   * @param requisitionId - Optional requisition ID filter
   * @returns Applications count by stage
   */
  async getApplicationsByStage(requisitionId?: string): Promise<any> {
    const query: any = {};
    if (requisitionId) {
      if (!Types.ObjectId.isValid(requisitionId)) {
        throw new BadRequestException('Invalid requisition ID');
      }
      query.requisitionId = new Types.ObjectId(requisitionId);
    }

    return {
      screening: await this.applicationModel
        .countDocuments({ ...query, currentStage: ApplicationStage.SCREENING })
        .exec(),
      departmentInterview: await this.applicationModel
        .countDocuments({
          ...query,
          currentStage: ApplicationStage.DEPARTMENT_INTERVIEW,
        })
        .exec(),
      hrInterview: await this.applicationModel
        .countDocuments({
          ...query,
          currentStage: ApplicationStage.HR_INTERVIEW,
        })
        .exec(),
      offer: await this.applicationModel
        .countDocuments({ ...query, currentStage: ApplicationStage.OFFER })
        .exec(),
    };
  }

  /**
   * Get applications grouped by status
   * @param requisitionId - Optional requisition ID filter
   * @returns Applications count by status
   */
  async getApplicationsByStatus(requisitionId?: string): Promise<any> {
    const query: any = {};
    if (requisitionId) {
      if (!Types.ObjectId.isValid(requisitionId)) {
        throw new BadRequestException('Invalid requisition ID');
      }
      query.requisitionId = new Types.ObjectId(requisitionId);
    }

    return {
      submitted: await this.applicationModel
        .countDocuments({ ...query, status: ApplicationStatus.SUBMITTED })
        .exec(),
      inProcess: await this.applicationModel
        .countDocuments({ ...query, status: ApplicationStatus.IN_PROCESS })
        .exec(),
      offer: await this.applicationModel
        .countDocuments({ ...query, status: ApplicationStatus.OFFER })
        .exec(),
      hired: await this.applicationModel
        .countDocuments({ ...query, status: ApplicationStatus.HIRED })
        .exec(),
      rejected: await this.applicationModel
        .countDocuments({ ...query, status: ApplicationStatus.REJECTED })
        .exec(),
    };
  }

  /**
   * Get time-to-hire metrics
   * @param requisitionId - Optional requisition ID filter
   * @returns Time-to-hire statistics
   */
  async getTimeToHireMetrics(requisitionId?: string): Promise<any> {
    const query: any = { status: ApplicationStatus.HIRED };
    if (requisitionId) {
      if (!Types.ObjectId.isValid(requisitionId)) {
        throw new BadRequestException('Invalid requisition ID');
      }
      query.requisitionId = new Types.ObjectId(requisitionId);
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
      const createdAt = (app as any).createdAt?.getTime() || Date.now();
      const updatedAt = (app as any).updatedAt?.getTime() || Date.now();
      return Math.floor((updatedAt - createdAt) / (1000 * 60 * 60 * 24)); // days
    });

    return {
      average: Math.round(
        timesToHire.reduce((a, b) => a + b, 0) / timesToHire.length,
      ),
      min: Math.min(...timesToHire),
      max: Math.max(...timesToHire),
      count: timesToHire.length,
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Create application history entry
   * @private
   * @param applicationId - Application ID
   * @param oldStage - Previous stage
   * @param newStage - New stage
   * @param oldStatus - Previous status
   * @param newStatus - New status
   * @param changedBy - User ID who made the change
   */
  private async createApplicationHistoryEntry(
    applicationId: string,
    oldStage: string | null,
    newStage: string,
    oldStatus: string | null,
    newStatus: string,
    changedBy: string,
  ): Promise<void> {
    await this.applicationHistoryModel.create({
      applicationId: new Types.ObjectId(applicationId),
      oldStage: oldStage || '',
      newStage,
      oldStatus: oldStatus || '',
      newStatus,
      changedBy: new Types.ObjectId(changedBy),
    });
  }
}
