import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RecruitmentService } from './recruitment.service';
import {
  CreateJobTemplateDto,
  UpdateJobTemplateDto,
  CreateJobRequisitionDto,
  UpdateJobRequisitionDto,
  CreateApplicationDto,
  UpdateApplicationStageDto,
  UpdateApplicationStatusDto,
  AssignHrDto,
  CreateInterviewDto,
  UpdateInterviewDto,
  CreateAssessmentResultDto,
  CreateOfferDto,
  UpdateOfferStatusDto,
  UpdateOfferApprovalDto,
  CreateContractDto,
  CreateOnboardingDto,
  UpdateOnboardingTaskDto,
  CreateTerminationRequestDto,
  UpdateTerminationStatusDto,
  UpdateClearanceChecklistDto,
  CreateReferralDto,
  CreateDocumentDto,
  UpdateDocumentDto,
} from './dto';

// NOTE: Service methods referenced in this controller will be implemented in Issue #3
// TypeScript errors for missing service methods are expected until Issue #3 is completed

@ApiTags('recruitment')
@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // ==================== Job Template Endpoints ====================

  @Post('job-templates')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new job template', description: 'Creates a standardized job description template for consistent job postings' })
  @ApiBody({ type: CreateJobTemplateDto })
  @ApiResponse({ status: 201, description: 'Job template created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createJobTemplate(@Body() createDto: CreateJobTemplateDto) {
    return this.recruitmentService.createJobTemplate(createDto);
  }

  @Get('job-templates')
  @ApiOperation({ summary: 'Get all job templates', description: 'Retrieves all job templates with optional filtering' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department' })
  @ApiResponse({ status: 200, description: 'List of job templates retrieved successfully' })
  async getJobTemplates(@Query() filters: any) {
    return this.recruitmentService.findAllJobTemplates(filters);
  }

  @Get('job-templates/:id')
  @ApiOperation({ summary: 'Get job template by ID', description: 'Retrieves a specific job template by its ID' })
  @ApiParam({ name: 'id', description: 'Job template ID' })
  @ApiResponse({ status: 200, description: 'Job template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Job template not found' })
  async getJobTemplateById(@Param('id') id: string) {
    return this.recruitmentService.findJobTemplateById(id);
  }

  @Patch('job-templates/:id')
  @ApiOperation({ summary: 'Update job template', description: 'Updates an existing job template' })
  @ApiParam({ name: 'id', description: 'Job template ID' })
  @ApiBody({ type: UpdateJobTemplateDto })
  @ApiResponse({ status: 200, description: 'Job template updated successfully' })
  @ApiResponse({ status: 404, description: 'Job template not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async updateJobTemplate(@Param('id') id: string, @Body() updateDto: UpdateJobTemplateDto) {
    return this.recruitmentService.updateJobTemplate(id, updateDto);
  }

  @Delete('job-templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete job template', description: 'Deletes a job template by ID' })
  @ApiParam({ name: 'id', description: 'Job template ID' })
  @ApiResponse({ status: 204, description: 'Job template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Job template not found' })
  async deleteJobTemplate(@Param('id') id: string) {
    return this.recruitmentService.deleteJobTemplate(id);
  }

  // ==================== Job Requisition Endpoints ====================

  @Post('job-requisitions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new job requisition', description: 'Creates a job requisition from a job template' })
  @ApiBody({ type: CreateJobRequisitionDto })
  @ApiResponse({ status: 201, description: 'Job requisition created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createJobRequisition(@Body() createDto: CreateJobRequisitionDto) {
    return this.recruitmentService.createJobRequisition(createDto);
  }

  @Get('job-requisitions')
  @ApiOperation({ summary: 'Get all job requisitions', description: 'Retrieves all job requisitions with optional filtering by status, department, etc.' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by publish status (draft, published, closed)' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department' })
  @ApiResponse({ status: 200, description: 'List of job requisitions retrieved successfully' })
  async getJobRequisitions(@Query() filters: any) {
    return this.recruitmentService.findAllJobRequisitions(filters);
  }

  @Get('job-requisitions/:id')
  @ApiOperation({ summary: 'Get job requisition by ID', description: 'Retrieves a specific job requisition by its ID' })
  @ApiParam({ name: 'id', description: 'Job requisition ID' })
  @ApiResponse({ status: 200, description: 'Job requisition retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Job requisition not found' })
  async getJobRequisitionById(@Param('id') id: string) {
    return this.recruitmentService.findJobRequisitionById(id);
  }

  @Patch('job-requisitions/:id')
  @ApiOperation({ summary: 'Update job requisition', description: 'Updates an existing job requisition' })
  @ApiParam({ name: 'id', description: 'Job requisition ID' })
  @ApiBody({ type: UpdateJobRequisitionDto })
  @ApiResponse({ status: 200, description: 'Job requisition updated successfully' })
  @ApiResponse({ status: 404, description: 'Job requisition not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async updateJobRequisition(@Param('id') id: string, @Body() updateDto: UpdateJobRequisitionDto) {
    return this.recruitmentService.updateJobRequisition(id, updateDto);
  }

  @Patch('job-requisitions/:id/publish')
  @ApiOperation({ summary: 'Publish job requisition', description: 'Publishes a job requisition to make it visible on careers page' })
  @ApiParam({ name: 'id', description: 'Job requisition ID' })
  @ApiResponse({ status: 200, description: 'Job requisition published successfully' })
  @ApiResponse({ status: 404, description: 'Job requisition not found' })
  async publishJobRequisition(@Param('id') id: string) {
    return this.recruitmentService.publishJobRequisition(id);
  }

  @Patch('job-requisitions/:id/close')
  @ApiOperation({ summary: 'Close job requisition', description: 'Closes a job requisition (no longer accepting applications)' })
  @ApiParam({ name: 'id', description: 'Job requisition ID' })
  @ApiResponse({ status: 200, description: 'Job requisition closed successfully' })
  @ApiResponse({ status: 404, description: 'Job requisition not found' })
  async closeJobRequisition(@Param('id') id: string) {
    return this.recruitmentService.closeJobRequisition(id);
  }

  @Get('job-requisitions/:id/preview')
  @ApiOperation({ summary: 'Preview job requisition', description: 'Gets a preview of how the job requisition will appear when published' })
  @ApiParam({ name: 'id', description: 'Job requisition ID' })
  @ApiResponse({ status: 200, description: 'Job requisition preview retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Job requisition not found' })
  async previewJobRequisition(@Param('id') id: string) {
    return this.recruitmentService.previewJobRequisition(id);
  }

  @Delete('job-requisitions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete job requisition', description: 'Deletes a job requisition by ID' })
  @ApiParam({ name: 'id', description: 'Job requisition ID' })
  @ApiResponse({ status: 204, description: 'Job requisition deleted successfully' })
  @ApiResponse({ status: 404, description: 'Job requisition not found' })
  async deleteJobRequisition(@Param('id') id: string) {
    return this.recruitmentService.deleteJobRequisition(id);
  }

  // ==================== Application Endpoints ====================

  @Post('applications')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit new application', description: 'Creates a new job application for a candidate' })
  @ApiBody({ type: CreateApplicationDto })
  @ApiResponse({ status: 201, description: 'Application submitted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createApplication(@Body() createDto: CreateApplicationDto) {
    return this.recruitmentService.createApplication(createDto);
  }

  @Get('applications')
  @ApiOperation({ summary: 'Get all applications', description: 'Retrieves all applications with optional filtering by status, stage, requisitionId, candidateId' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by application status' })
  @ApiQuery({ name: 'stage', required: false, description: 'Filter by application stage' })
  @ApiQuery({ name: 'requisitionId', required: false, description: 'Filter by job requisition ID' })
  @ApiQuery({ name: 'candidateId', required: false, description: 'Filter by candidate ID' })
  @ApiResponse({ status: 200, description: 'List of applications retrieved successfully' })
  async getApplications(@Query() filters: any) {
    return this.recruitmentService.findAllApplications(filters);
  }

  @Get('applications/:id')
  @ApiOperation({ summary: 'Get application by ID', description: 'Retrieves a specific application by its ID' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Application retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async getApplicationById(@Param('id') id: string) {
    return this.recruitmentService.findApplicationById(id);
  }

  @Patch('applications/:id/stage')
  @ApiOperation({ summary: 'Update application stage', description: 'Updates the current stage of an application (screening, department_interview, hr_interview, offer)' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiBody({ type: UpdateApplicationStageDto })
  @ApiResponse({ status: 200, description: 'Application stage updated successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async updateApplicationStage(@Param('id') id: string, @Body() updateDto: UpdateApplicationStageDto) {
    return this.recruitmentService.updateApplicationStage(id, updateDto);
  }

  @Patch('applications/:id/status')
  @ApiOperation({ summary: 'Update application status', description: 'Updates the status of an application (submitted, in_process, offer, hired, rejected)' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiBody({ type: UpdateApplicationStatusDto })
  @ApiResponse({ status: 200, description: 'Application status updated successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async updateApplicationStatus(@Param('id') id: string, @Body() updateDto: UpdateApplicationStatusDto) {
    return this.recruitmentService.updateApplicationStatus(id, updateDto);
  }

  @Patch('applications/:id/assign-hr')
  @ApiOperation({ summary: 'Assign HR to application', description: 'Assigns or reassigns an HR representative to an application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiBody({ type: AssignHrDto })
  @ApiResponse({ status: 200, description: 'HR assigned successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 400, description: 'Bad request - HR employee ID is required' })
  async assignHrToApplication(@Param('id') id: string, @Body() assignDto: AssignHrDto) {
    if (!assignDto.assignedHr) {
      throw new BadRequestException('HR employee ID is required');
    }
    return this.recruitmentService.assignHrToApplication(id, assignDto.assignedHr);
  }

  @Get('applications/:id/history')
  @ApiOperation({ summary: 'Get application status history', description: 'Retrieves the complete status and stage change history for an application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Application history retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async getApplicationHistory(@Param('id') id: string) {
    return this.recruitmentService.getApplicationHistory(id);
  }

  @Get('applications/:id/communication-logs')
  @ApiOperation({ summary: 'Get application communication logs', description: 'Retrieves all communication logs for an application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Communication logs retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async getApplicationCommunicationLogs(@Param('id') id: string) {
    return this.recruitmentService.getApplicationCommunicationLogs(id);
  }

  @Post('applications/:id/consent')
  @ApiOperation({ summary: 'Record consent for application', description: 'Records candidate consent for personal data processing (GDPR compliance)' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Consent recorded successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async recordConsent(@Param('id') id: string, @Body() consentDto: any) {
    // TODO: Create CreateConsentDto when consent management is implemented
    return this.recruitmentService.recordConsent(id, consentDto);
  }

  @Get('applications/:id/consent')
  @ApiOperation({ summary: 'Get consent status', description: 'Retrieves the consent status for an application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Consent status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async getConsentStatus(@Param('id') id: string) {
    return this.recruitmentService.getConsentStatus(id);
  }

  // ==================== Interview Endpoints ====================

  @Post('interviews')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Schedule new interview', description: 'Schedules a new interview for an application with panel members, date, and method' })
  @ApiBody({ type: CreateInterviewDto })
  @ApiResponse({ status: 201, description: 'Interview scheduled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createInterview(@Body() createDto: CreateInterviewDto) {
    return this.recruitmentService.createInterview(createDto);
  }

  @Get('interviews')
  @ApiOperation({ summary: 'Get all interviews', description: 'Retrieves all interviews with optional filtering by applicationId, status, date range' })
  @ApiQuery({ name: 'applicationId', required: false, description: 'Filter by application ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by interview status' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (ISO string)' })
  @ApiResponse({ status: 200, description: 'List of interviews retrieved successfully' })
  async getInterviews(@Query() filters: any) {
    return this.recruitmentService.findAllInterviews(filters);
  }

  @Get('interviews/:id')
  @ApiOperation({ summary: 'Get interview by ID', description: 'Retrieves a specific interview by its ID' })
  @ApiParam({ name: 'id', description: 'Interview ID' })
  @ApiResponse({ status: 200, description: 'Interview retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async getInterviewById(@Param('id') id: string) {
    return this.recruitmentService.findInterviewById(id);
  }

  @Patch('interviews/:id')
  @ApiOperation({ summary: 'Update interview details', description: 'Updates interview details such as date, method, panel members, video link' })
  @ApiParam({ name: 'id', description: 'Interview ID' })
  @ApiBody({ type: UpdateInterviewDto })
  @ApiResponse({ status: 200, description: 'Interview updated successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async updateInterview(@Param('id') id: string, @Body() updateDto: UpdateInterviewDto) {
    return this.recruitmentService.updateInterview(id, updateDto);
  }

  @Patch('interviews/:id/status')
  @ApiOperation({ summary: 'Update interview status', description: 'Updates the status of an interview (scheduled, completed, cancelled)' })
  @ApiParam({ name: 'id', description: 'Interview ID' })
  @ApiBody({ type: UpdateInterviewDto })
  @ApiResponse({ status: 200, description: 'Interview status updated successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  @ApiResponse({ status: 400, description: 'Bad request - interview status is required' })
  async updateInterviewStatus(@Param('id') id: string, @Body() statusDto: UpdateInterviewDto) {
    if (!statusDto.status) {
      throw new BadRequestException('Interview status is required');
    }
    return this.recruitmentService.updateInterviewStatus(id, statusDto.status);
  }

  @Post('interviews/:id/assessment')
  @ApiOperation({ summary: 'Submit interview assessment', description: 'Submits interview feedback and scores from an interviewer' })
  @ApiParam({ name: 'id', description: 'Interview ID' })
  @ApiBody({ type: CreateAssessmentResultDto })
  @ApiResponse({ status: 201, description: 'Assessment submitted successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async submitAssessment(@Param('id') id: string, @Body() assessmentDto: CreateAssessmentResultDto) {
    return this.recruitmentService.createAssessmentResult(assessmentDto);
  }

  @Get('interviews/:id/assessment')
  @ApiOperation({ summary: 'Get interview assessment', description: 'Retrieves all assessment results for an interview' })
  @ApiParam({ name: 'id', description: 'Interview ID' })
  @ApiResponse({ status: 200, description: 'Assessment results retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async getInterviewAssessment(@Param('id') id: string) {
    return this.recruitmentService.getInterviewAssessment(id);
  }

  @Post('interviews/:id/send-calendar-invite')
  @ApiOperation({ summary: 'Send calendar invite', description: 'Sends calendar invites to interviewers and candidate for the scheduled interview' })
  @ApiParam({ name: 'id', description: 'Interview ID' })
  @ApiResponse({ status: 200, description: 'Calendar invites sent successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async sendCalendarInvite(@Param('id') id: string) {
    return this.recruitmentService.sendCalendarInvite(id);
  }

  // ==================== Offer Endpoints ====================

  @Post('offers')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create job offer', description: 'Creates a job offer with compensation details, benefits, and approval workflow' })
  @ApiBody({ type: CreateOfferDto })
  @ApiResponse({ status: 201, description: 'Offer created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createOffer(@Body() createDto: CreateOfferDto) {
    return this.recruitmentService.createOffer(createDto);
  }

  @Get('offers')
  @ApiOperation({ summary: 'Get all offers', description: 'Retrieves all offers with optional filtering by applicationId, candidateId, status' })
  @ApiQuery({ name: 'applicationId', required: false, description: 'Filter by application ID' })
  @ApiQuery({ name: 'candidateId', required: false, description: 'Filter by candidate ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by offer status' })
  @ApiResponse({ status: 200, description: 'List of offers retrieved successfully' })
  async getOffers(@Query() filters: any) {
    return this.recruitmentService.findAllOffers(filters);
  }

  @Get('offers/:id')
  @ApiOperation({ summary: 'Get offer by ID', description: 'Retrieves a specific offer by its ID' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: 200, description: 'Offer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async getOfferById(@Param('id') id: string) {
    return this.recruitmentService.findOfferById(id);
  }

  @Patch('offers/:id')
  @ApiOperation({ summary: 'Update offer details', description: 'Updates offer details such as compensation, benefits, content, deadline' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: 200, description: 'Offer updated successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async updateOffer(@Param('id') id: string, @Body() updateDto: any) {
    return this.recruitmentService.updateOffer(id, updateDto);
  }

  @Patch('offers/:id/response')
  @ApiOperation({ summary: 'Update candidate response', description: 'Updates the candidate response to an offer (accepted, rejected, pending)' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiBody({ type: UpdateOfferStatusDto })
  @ApiResponse({ status: 200, description: 'Offer response updated successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async updateOfferResponse(@Param('id') id: string, @Body() responseDto: UpdateOfferStatusDto) {
    return this.recruitmentService.updateOfferResponse(id, responseDto.applicantResponse);
  }

  @Patch('offers/:id/approval')
  @ApiOperation({ summary: 'Update approval workflow status', description: 'Updates the approval workflow status for an offer (individual approver status)' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: 200, description: 'Approval status updated successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async updateOfferApproval(@Param('id') id: string, @Body() approvalDto: any) {
    return this.recruitmentService.updateOfferApproval(
      id,
      approvalDto.approverId,
      approvalDto.status,
    );
  }

  @Post('offers/:id/sign')
  @ApiOperation({ summary: 'Sign offer', description: 'Signs an offer letter (candidate, HR, or manager signature)' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: 200, description: 'Offer signed successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async signOffer(@Param('id') id: string, @Body() signDto: any) {
    return this.recruitmentService.signOffer(
      id,
      signDto.signerType,
      signDto.signature,
    );
  }

  @Post('offers/:id/generate-pdf')
  @ApiOperation({ summary: 'Generate offer PDF', description: 'Generates a PDF document for the offer letter' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: 200, description: 'Offer PDF generated successfully', content: { 'application/pdf': {} } })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async generateOfferPDF(@Param('id') id: string) {
    return this.recruitmentService.generateOfferPDF(id);
  }

  @Post('offers/:id/send')
  @ApiOperation({ summary: 'Send offer to candidate', description: 'Sends the offer letter to the candidate via email' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: 200, description: 'Offer sent successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async sendOfferToCandidate(@Param('id') id: string) {
    return this.recruitmentService.sendOfferToCandidate(id);
  }

  // ==================== Contract Endpoints ====================

  @Post('contracts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create contract from accepted offer', description: 'Creates an employment contract from an accepted offer' })
  @ApiBody({ type: CreateContractDto })
  @ApiResponse({ status: 201, description: 'Contract created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createContract(@Body() createDto: CreateContractDto) {
    return this.recruitmentService.createContract(createDto);
  }

  @Get('contracts')
  @ApiOperation({ summary: 'Get all contracts', description: 'Retrieves all employment contracts' })
  @ApiQuery({ name: 'offerId', required: false, description: 'Filter by offer ID' })
  @ApiResponse({ status: 200, description: 'List of contracts retrieved successfully' })
  async getContracts(@Query() filters: any) {
    return this.recruitmentService.findAllContracts(filters);
  }

  @Get('contracts/:id')
  @ApiOperation({ summary: 'Get contract by ID', description: 'Retrieves a specific contract by its ID' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 200, description: 'Contract retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async getContractById(@Param('id') id: string) {
    return this.recruitmentService.findContractById(id);
  }

  @Patch('contracts/:id/sign')
  @ApiOperation({ summary: 'Sign contract', description: 'Signs a contract (employee or employer signature)' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 200, description: 'Contract signed successfully' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async signContract(@Param('id') id: string, @Body() signDto: any) {
    return this.recruitmentService.signContract(
      id,
      signDto.signerType,
      signDto.signatureUrl,
    );
  }

  @Get('contracts/:id/pdf')
  @ApiOperation({ summary: 'Get contract PDF', description: 'Retrieves the contract as a PDF document' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 200, description: 'Contract PDF retrieved successfully', content: { 'application/pdf': {} } })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async getContractPDF(@Param('id') id: string) {
    return this.recruitmentService.generateContractPDF(id);
  }

  @Get('contracts/offer/:offerId')
  @ApiOperation({ summary: 'Get contract by offer ID', description: 'Retrieves a contract associated with a specific offer' })
  @ApiParam({ name: 'offerId', description: 'Offer ID' })
  @ApiResponse({ status: 200, description: 'Contract retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async getContractByOfferId(@Param('offerId') offerId: string) {
    return this.recruitmentService.getContractByOfferId(offerId);
  }

  // ==================== Onboarding Endpoints ====================

  @Post('onboarding')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initialize onboarding process', description: 'Creates an onboarding checklist and tasks for a new employee' })
  @ApiBody({ type: CreateOnboardingDto })
  @ApiResponse({ status: 201, description: 'Onboarding process initialized successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createOnboarding(@Body() createDto: CreateOnboardingDto) {
    return this.recruitmentService.createOnboarding(createDto);
  }

  @Get('onboarding/:employeeId')
  @ApiOperation({ summary: 'Get onboarding by employee ID', description: 'Retrieves onboarding information for a specific employee' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Onboarding information retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Onboarding not found' })
  async getOnboardingByEmployeeId(@Param('employeeId') employeeId: string) {
    return this.recruitmentService.findOnboardingByEmployeeId(employeeId);
  }

  @Patch('onboarding/:id/tasks/:taskId')
  @ApiOperation({ summary: 'Update onboarding task status', description: 'Updates the status of a specific onboarding task' })
  @ApiParam({ name: 'id', description: 'Onboarding ID' })
  @ApiParam({ name: 'taskId', description: 'Task ID' })
  @ApiBody({ type: UpdateOnboardingTaskDto })
  @ApiResponse({ status: 200, description: 'Onboarding task updated successfully' })
  @ApiResponse({ status: 404, description: 'Onboarding or task not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async updateOnboardingTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() updateDto: UpdateOnboardingTaskDto,
  ) {
    return this.recruitmentService.updateOnboardingTask(id, taskId, updateDto);
  }

  @Patch('onboarding/:id/complete')
  @ApiOperation({ summary: 'Mark onboarding as complete', description: 'Marks the entire onboarding process as completed' })
  @ApiParam({ name: 'id', description: 'Onboarding ID' })
  @ApiResponse({ status: 200, description: 'Onboarding marked as complete' })
  @ApiResponse({ status: 404, description: 'Onboarding not found' })
  async completeOnboarding(@Param('id') id: string) {
    return this.recruitmentService.completeOnboarding(id);
  }

  @Get('onboarding/:id/tasks')
  @ApiOperation({ summary: 'Get all onboarding tasks', description: 'Retrieves all tasks for an onboarding process' })
  @ApiParam({ name: 'id', description: 'Onboarding ID' })
  @ApiResponse({ status: 200, description: 'Onboarding tasks retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Onboarding not found' })
  async getOnboardingTasks(@Param('id') id: string) {
    return this.recruitmentService.getOnboardingTasks(id);
  }

  // ==================== Termination Endpoints ====================

  @Post('terminations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create termination request', description: 'Creates a termination request for an employee (resignation or termination)' })
  @ApiBody({ type: CreateTerminationRequestDto })
  @ApiResponse({ status: 201, description: 'Termination request created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createTerminationRequest(@Body() createDto: CreateTerminationRequestDto) {
    return this.recruitmentService.createTerminationRequest(createDto);
  }

  @Get('terminations')
  @ApiOperation({ summary: 'Get all termination requests', description: 'Retrieves all termination requests with optional filtering' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by termination status' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by termination type (resignation, termination)' })
  @ApiResponse({ status: 200, description: 'List of termination requests retrieved successfully' })
  async getTerminationRequests(@Query() filters: any) {
    return this.recruitmentService.findAllTerminationRequests(filters);
  }

  @Get('terminations/:id')
  @ApiOperation({ summary: 'Get termination request by ID', description: 'Retrieves a specific termination request by its ID' })
  @ApiParam({ name: 'id', description: 'Termination request ID' })
  @ApiResponse({ status: 200, description: 'Termination request retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Termination request not found' })
  async getTerminationRequestById(@Param('id') id: string) {
    return this.recruitmentService.findTerminationRequestById(id);
  }

  @Patch('terminations/:id/status')
  @ApiOperation({ summary: 'Update termination status', description: 'Updates the status of a termination request' })
  @ApiParam({ name: 'id', description: 'Termination request ID' })
  @ApiBody({ type: UpdateTerminationStatusDto })
  @ApiResponse({ status: 200, description: 'Termination status updated successfully' })
  @ApiResponse({ status: 404, description: 'Termination request not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async updateTerminationStatus(@Param('id') id: string, @Body() statusDto: UpdateTerminationStatusDto) {
    return this.recruitmentService.updateTerminationStatus(id, statusDto.status);
  }

  @Get('terminations/:id/clearance')
  @ApiOperation({ summary: 'Get clearance checklist', description: 'Retrieves the clearance checklist for a termination request' })
  @ApiParam({ name: 'id', description: 'Termination request ID' })
  @ApiResponse({ status: 200, description: 'Clearance checklist retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Termination request not found' })
  async getClearanceChecklist(@Param('id') id: string) {
    return this.recruitmentService.getClearanceChecklist(id);
  }

  @Patch('terminations/:id/clearance')
  @ApiOperation({ summary: 'Update clearance checklist', description: 'Updates the clearance checklist items for a termination request' })
  @ApiParam({ name: 'id', description: 'Termination request ID' })
  @ApiBody({ type: UpdateClearanceChecklistDto })
  @ApiResponse({ status: 200, description: 'Clearance checklist updated successfully' })
  @ApiResponse({ status: 404, description: 'Termination request not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async updateClearanceChecklist(@Param('id') id: string, @Body() updateDto: UpdateClearanceChecklistDto) {
    return this.recruitmentService.updateClearanceChecklist(id, updateDto);
  }

  // ==================== Supporting Endpoints ====================

  @Post('referrals')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create employee referral', description: 'Creates a referral record when an employee refers a candidate' })
  @ApiBody({ type: CreateReferralDto })
  @ApiResponse({ status: 201, description: 'Referral created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createReferral(@Body() createDto: CreateReferralDto) {
    return this.recruitmentService.createReferral(createDto);
  }

  @Get('referrals')
  @ApiOperation({ summary: 'Get all referrals', description: 'Retrieves all employee referrals with optional filtering' })
  @ApiQuery({ name: 'referrerId', required: false, description: 'Filter by referrer employee ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by referral status' })
  @ApiResponse({ status: 200, description: 'List of referrals retrieved successfully' })
  async getReferrals(@Query() filters: any) {
    return this.recruitmentService.findAllReferrals(filters);
  }

  @Get('referrals/:id')
  @ApiOperation({ summary: 'Get referral by ID', description: 'Retrieves a specific referral by its ID' })
  @ApiParam({ name: 'id', description: 'Referral ID' })
  @ApiResponse({ status: 200, description: 'Referral retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Referral not found' })
  async getReferralById(@Param('id') id: string) {
    return this.recruitmentService.findReferralById(id);
  }

  @Patch('referrals/:id')
  @ApiOperation({ summary: 'Update referral', description: 'Updates an existing referral' })
  @ApiParam({ name: 'id', description: 'Referral ID' })
  @ApiBody({ type: CreateReferralDto })
  @ApiResponse({ status: 200, description: 'Referral updated successfully' })
  @ApiResponse({ status: 404, description: 'Referral not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async updateReferral(@Param('id') id: string, @Body() updateDto: any) {
    return this.recruitmentService.updateReferral(id, updateDto);
  }

  @Delete('referrals/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete referral', description: 'Deletes a referral by ID' })
  @ApiParam({ name: 'id', description: 'Referral ID' })
  @ApiResponse({ status: 204, description: 'Referral deleted successfully' })
  @ApiResponse({ status: 404, description: 'Referral not found' })
  async deleteReferral(@Param('id') id: string) {
    return this.recruitmentService.deleteReferral(id);
  }

  @Post('documents')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload document', description: 'Uploads a document (resume, certificate, etc.) with metadata' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
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
  })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or invalid file' })
  async uploadDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /(pdf|doc|docx|jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: any, // Express.Multer.File - type will be available when multer types are installed
    @Body() documentDto: CreateDocumentDto,
  ) {
    return this.recruitmentService.createDocument({
      ...documentDto,
      filePath: file.path,
      fileName: file.originalname,
      fileSize: file.size,
    });
  }

  @Get('documents')
  @ApiOperation({ summary: 'Get all documents', description: 'Retrieves all documents with optional filtering' })
  @ApiQuery({ name: 'entityType', required: false, description: 'Filter by entity type (application, candidate, offer, etc.)' })
  @ApiQuery({ name: 'entityId', required: false, description: 'Filter by entity ID' })
  @ApiQuery({ name: 'documentType', required: false, description: 'Filter by document type' })
  @ApiResponse({ status: 200, description: 'List of documents retrieved successfully' })
  async getDocuments(@Query() filters: any) {
    return this.recruitmentService.findAllDocuments(filters);
  }

  @Get('documents/:id')
  @ApiOperation({ summary: 'Get document by ID', description: 'Retrieves document metadata by ID' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocumentById(@Param('id') id: string) {
    return this.recruitmentService.findDocumentById(id);
  }

  @Patch('documents/:id')
  @ApiOperation({ summary: 'Update document', description: 'Updates document metadata' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiBody({ type: UpdateDocumentDto })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async updateDocument(@Param('id') id: string, @Body() updateDto: UpdateDocumentDto) {
    return this.recruitmentService.updateDocument(id, updateDto);
  }

  @Delete('documents/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete document', description: 'Deletes a document by ID' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 204, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async deleteDocument(@Param('id') id: string) {
    return this.recruitmentService.deleteDocument(id);
  }

  @Get('documents/:id/download')
  @ApiOperation({ summary: 'Download document', description: 'Downloads a document file' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document file downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async downloadDocument(@Param('id') id: string) {
    return this.recruitmentService.downloadDocument(id);
  }

  // ==================== Dashboard & Reporting Endpoints ====================

  @Get('dashboard/overview')
  @ApiOperation({ summary: 'Get recruitment overview', description: 'Retrieves high-level recruitment statistics and overview data' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (ISO string)' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department' })
  @ApiResponse({ status: 200, description: 'Recruitment overview retrieved successfully' })
  async getRecruitmentOverview(@Query() filters: any) {
    return this.recruitmentService.getRecruitmentOverview(filters);
  }

  @Get('dashboard/metrics')
  @ApiOperation({ summary: 'Get recruitment metrics', description: 'Retrieves detailed recruitment metrics (time-to-hire, offer acceptance rate, etc.)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (ISO string)' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department' })
  @ApiResponse({ status: 200, description: 'Recruitment metrics retrieved successfully' })
  async getRecruitmentMetrics(@Query() filters: any) {
    return this.recruitmentService.getRecruitmentMetrics(filters);
  }

  @Get('dashboard/pipeline')
  @ApiOperation({ summary: 'Get pipeline view', description: 'Retrieves the recruitment pipeline view showing applications by stage' })
  @ApiQuery({ name: 'requisitionId', required: false, description: 'Filter by job requisition ID' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department' })
  @ApiResponse({ status: 200, description: 'Pipeline view retrieved successfully' })
  async getPipelineView(@Query() filters: any) {
    return this.recruitmentService.getPipelineView(filters);
  }

  @Get('dashboard/requisitions/:id/metrics')
  @ApiOperation({ summary: 'Get requisition metrics', description: 'Retrieves metrics for a specific job requisition' })
  @ApiParam({ name: 'id', description: 'Job requisition ID' })
  @ApiResponse({ status: 200, description: 'Requisition metrics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Job requisition not found' })
  async getRequisitionMetrics(@Param('id') id: string) {
    return this.recruitmentService.getRequisitionMetrics(id);
  }

  @Get('dashboard/applications-by-stage')
  @ApiOperation({ summary: 'Get applications by stage', description: 'Retrieves application counts grouped by stage for a requisition' })
  @ApiQuery({ name: 'requisitionId', required: false, description: 'Filter by job requisition ID' })
  @ApiResponse({ status: 200, description: 'Applications by stage retrieved successfully' })
  async getApplicationsByStage(@Query() filters: any) {
    return this.recruitmentService.getApplicationsByStage(filters.requisitionId);
  }

  @Get('dashboard/applications-by-status')
  @ApiOperation({ summary: 'Get applications by status', description: 'Retrieves application counts grouped by status for a requisition' })
  @ApiQuery({ name: 'requisitionId', required: false, description: 'Filter by job requisition ID' })
  @ApiResponse({ status: 200, description: 'Applications by status retrieved successfully' })
  async getApplicationsByStatus(@Query() filters: any) {
    return this.recruitmentService.getApplicationsByStatus(filters.requisitionId);
  }

  @Get('dashboard/time-to-hire')
  @ApiOperation({ summary: 'Get time-to-hire metrics', description: 'Retrieves time-to-hire metrics for recruitment analysis' })
  @ApiQuery({ name: 'requisitionId', required: false, description: 'Filter by job requisition ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (ISO string)' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department' })
  @ApiResponse({ status: 200, description: 'Time-to-hire metrics retrieved successfully' })
  async getTimeToHireMetrics(@Query() filters: any) {
    return this.recruitmentService.getTimeToHireMetrics(filters.requisitionId);
  }
}
