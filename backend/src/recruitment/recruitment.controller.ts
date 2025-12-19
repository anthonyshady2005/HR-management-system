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
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import express from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
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
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, Public } from '../common/decorators';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
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
  CreateConsentDto,
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
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // ==================== Job Template Endpoints ====================

  @Post('job-templates')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new job template', description: 'Creates a standardized job description template for consistent job postings' })
  @ApiBody({ type: CreateJobTemplateDto })
  @ApiResponse({ status: 201, description: 'Job template created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createJobTemplate(@Body() createDto: CreateJobTemplateDto) {
    return this.recruitmentService.createJobTemplate(createDto);
  }

  @Get('job-templates')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get all job templates', description: 'Retrieves all job templates with optional filtering' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department' })
  @ApiResponse({ status: 200, description: 'List of job templates retrieved successfully' })
  async getJobTemplates(@Query() filters: any) {
    return this.recruitmentService.findAllJobTemplates(filters);
  }

  @Get('job-templates/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get job template by ID', description: 'Retrieves a specific job template by its ID' })
  @ApiParam({ name: 'id', description: 'Job template ID' })
  @ApiResponse({ status: 200, description: 'Job template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Job template not found' })
  async getJobTemplateById(@Param('id') id: string) {
    return this.recruitmentService.findJobTemplateById(id);
  }

  @Patch('job-templates/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
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
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
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
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new job requisition', description: 'Creates a job requisition from a job template' })
  @ApiBody({ type: CreateJobRequisitionDto })
  @ApiResponse({ status: 201, description: 'Job requisition created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createJobRequisition(@Body() createDto: CreateJobRequisitionDto) {
    return this.recruitmentService.createJobRequisition(createDto);
  }

  @Get('job-requisitions')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.DEPARTMENT_HEAD, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get all job requisitions', description: 'Retrieves all job requisitions with optional filtering by status, department, etc.' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by publish status (draft, published, closed)' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department' })
  @ApiResponse({ status: 200, description: 'List of job requisitions retrieved successfully' })
  async getJobRequisitions(@Query() filters: any) {
    return this.recruitmentService.findAllJobRequisitions(filters);
  }

  @Get('job-requisitions/public')
  @Public()
  @ApiOperation({ summary: 'Get published job requisitions', description: 'Public endpoint to retrieve all published job requisitions for careers page' })
  @ApiResponse({ status: 200, description: 'List of published job requisitions retrieved successfully' })
  async getPublicJobRequisitions() {
    return this.recruitmentService.findPublishedJobRequisitions();
  }

  @Get('job-requisitions/:id')
  @Public()
  @ApiOperation({ summary: 'Get job requisition by ID', description: 'Retrieves a specific job requisition by its ID' })
  @ApiParam({ name: 'id', description: 'Job requisition ID' })
  @ApiResponse({ status: 200, description: 'Job requisition retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Job requisition not found' })
  async getJobRequisitionById(@Param('id') id: string) {
    return this.recruitmentService.findJobRequisitionById(id);
  }

  @Patch('job-requisitions/:id')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.SYSTEM_ADMIN)
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
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Publish job requisition', description: 'Publishes a job requisition to make it visible on careers page' })
  @ApiParam({ name: 'id', description: 'Job requisition ID' })
  @ApiResponse({ status: 200, description: 'Job requisition published successfully' })
  @ApiResponse({ status: 404, description: 'Job requisition not found' })
  async publishJobRequisition(@Param('id') id: string) {
    return this.recruitmentService.publishJobRequisition(id);
  }

  @Patch('job-requisitions/:id/close')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Close job requisition', description: 'Closes a job requisition (no longer accepting applications)' })
  @ApiParam({ name: 'id', description: 'Job requisition ID' })
  @ApiResponse({ status: 200, description: 'Job requisition closed successfully' })
  @ApiResponse({ status: 404, description: 'Job requisition not found' })
  async closeJobRequisition(@Param('id') id: string) {
    return this.recruitmentService.closeJobRequisition(id);
  }

  @Get('job-requisitions/:id/preview')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Preview job requisition', description: 'Gets a preview of how the job requisition will appear when published' })
  @ApiParam({ name: 'id', description: 'Job requisition ID' })
  @ApiResponse({ status: 200, description: 'Job requisition preview retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Job requisition not found' })
  async previewJobRequisition(@Param('id') id: string) {
    return this.recruitmentService.previewJobRequisition(id);
  }

  @Delete('job-requisitions/:id')
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete job requisition', description: 'Deletes a job requisition by ID' })
  @ApiParam({ name: 'id', description: 'Job requisition ID' })
  @ApiResponse({ status: 204, description: 'Job requisition deleted successfully' })
  @ApiResponse({ status: 404, description: 'Job requisition not found' })
  async deleteJobRequisition(@Param('id') id: string) {
    return this.recruitmentService.deleteJobRequisition(id);
  }

  // ==================== Application Endpoints ====================

  @Post('candidates')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create candidate profile', description: 'Creates or finds a candidate profile for job applications' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['firstName', 'lastName', 'personalEmail', 'nationalId'],
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        personalEmail: { type: 'string', format: 'email' },
        nationalId: { type: 'string' },
        mobilePhone: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Candidate created or found successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createCandidate(@Body() candidateData: {
    firstName: string;
    lastName: string;
    personalEmail: string;
    nationalId: string;
    mobilePhone?: string;
  }) {
    return this.recruitmentService.createOrFindCandidate(candidateData);
  }

  @Post('applications')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit new application', description: 'Creates a new job application for a candidate' })
  @ApiBody({ type: CreateApplicationDto })
  @ApiResponse({ status: 201, description: 'Application submitted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createApplication(@Body() createDto: CreateApplicationDto) {
    return this.recruitmentService.createApplication(createDto);
  }

  @Get('applications')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.DEPARTMENT_HEAD, SystemRole.SYSTEM_ADMIN)
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
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.DEPARTMENT_HEAD, SystemRole.JOB_CANDIDATE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get application by ID', description: 'Retrieves a specific application by its ID' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Application retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not authorized to access this application' })
  async getApplicationById(@Param('id') id: string, @Req() req: express.Request) {
    const userId = (req as any).user?._id?.toString() as string;
    const userRoles = (req as any).user?.roles || [];
    return this.recruitmentService.findApplicationById(id, userId, userRoles);
  }

  @Patch('applications/:id/stage')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.SYSTEM_ADMIN)
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
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
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
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
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
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.JOB_CANDIDATE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get application status history', description: 'Retrieves the complete status and stage change history for an application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Application history retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not authorized to access this application' })
  async getApplicationHistory(@Param('id') id: string, @Req() req: express.Request) {
    const userId = (req as any).user?._id?.toString() as string;
    const userRoles = (req as any).user?.roles || [];
    return this.recruitmentService.getApplicationHistory(id, userId, userRoles);
  }

  @Get('applications/:id/communication-logs')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.JOB_CANDIDATE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get application communication logs', description: 'Retrieves all communication logs for an application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Communication logs retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not authorized to access this application' })
  async getApplicationCommunicationLogs(@Param('id') id: string, @Req() req: express.Request) {
    const userId = (req as any).user?._id?.toString() as string;
    const userRoles = (req as any).user?.roles || [];
    return this.recruitmentService.getApplicationCommunicationLogs(id, userId, userRoles);
  }

  @Post('applications/:id/consent')
  @Public()
  @ApiOperation({ summary: 'Record consent for application', description: 'Records candidate consent for personal data processing (GDPR compliance)' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Consent recorded successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async recordConsent(@Param('id') id: string, @Body() consentDto: CreateConsentDto) {
    return this.recruitmentService.recordConsent(id, consentDto);
  }

  @Get('applications/:id/consent')
  @Roles(SystemRole.JOB_CANDIDATE, SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get consent status', description: 'Retrieves the consent status for an application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Consent status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async getConsentStatus(@Param('id') id: string) {
    return this.recruitmentService.getConsentStatus(id);
  }

  // ==================== Interview Endpoints ====================

  @Post('interviews')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.DEPARTMENT_HEAD, SystemRole.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Schedule new interview', description: 'Schedules a new interview for an application with panel members, date, and method' })
  @ApiBody({ type: CreateInterviewDto })
  @ApiResponse({ status: 201, description: 'Interview scheduled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createInterview(@Body() createDto: CreateInterviewDto) {
    return this.recruitmentService.createInterview(createDto);
  }

  @Get('interviews')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.DEPARTMENT_HEAD, SystemRole.JOB_CANDIDATE, SystemRole.SYSTEM_ADMIN)
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
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.DEPARTMENT_HEAD, SystemRole.JOB_CANDIDATE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get interview by ID', description: 'Retrieves a specific interview by its ID' })
  @ApiParam({ name: 'id', description: 'Interview ID' })
  @ApiResponse({ status: 200, description: 'Interview retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not authorized to access this interview' })
  async getInterviewById(@Param('id') id: string, @Req() req: express.Request) {
    const userId = (req as any).user?._id?.toString() as string;
    const userRoles = (req as any).user?.roles || [];
    return this.recruitmentService.findInterviewById(id, userId, userRoles);
  }

  @Patch('interviews/:id')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.SYSTEM_ADMIN)
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
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.DEPARTMENT_HEAD, SystemRole.SYSTEM_ADMIN)
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
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.DEPARTMENT_HEAD, SystemRole.SYSTEM_ADMIN)
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
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.DEPARTMENT_HEAD, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get interview assessment', description: 'Retrieves all assessment results for an interview' })
  @ApiParam({ name: 'id', description: 'Interview ID' })
  @ApiResponse({ status: 200, description: 'Assessment results retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async getInterviewAssessment(@Param('id') id: string) {
    return this.recruitmentService.getInterviewAssessment(id);
  }

  @Post('interviews/:id/send-calendar-invite')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Send calendar invite', description: 'Sends calendar invites to interviewers and candidate for the scheduled interview' })
  @ApiParam({ name: 'id', description: 'Interview ID' })
  @ApiResponse({ status: 200, description: 'Calendar invites sent successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async sendCalendarInvite(@Param('id') id: string) {
    return this.recruitmentService.sendCalendarInvite(id);
  }

  @Delete('interviews/:id')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Delete interview', description: 'Deletes an interview by ID' })
  @ApiParam({ name: 'id', description: 'Interview ID' })
  @ApiResponse({ status: 200, description: 'Interview deleted successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async deleteInterview(@Param('id') id: string) {
    await this.recruitmentService.deleteInterview(id);
    return { message: 'Interview deleted successfully' };
  }

  // ==================== Offer Endpoints ====================

  @Post('offers')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create job offer', description: 'Creates a job offer with compensation details, benefits, and approval workflow' })
  @ApiBody({ type: CreateOfferDto })
  @ApiResponse({ status: 201, description: 'Offer created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createOffer(@Body() createDto: CreateOfferDto) {
    return this.recruitmentService.createOffer(createDto);
  }

  @Get('offers')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.JOB_CANDIDATE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get all offers', description: 'Retrieves all offers with optional filtering by applicationId, candidateId, status' })
  @ApiQuery({ name: 'applicationId', required: false, description: 'Filter by application ID' })
  @ApiQuery({ name: 'candidateId', required: false, description: 'Filter by candidate ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by offer status' })
  @ApiResponse({ status: 200, description: 'List of offers retrieved successfully' })
  async getOffers(@Query() filters: any) {
    return this.recruitmentService.findAllOffers(filters);
  }

  @Get('offers/:id')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.JOB_CANDIDATE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get offer by ID', description: 'Retrieves a specific offer by its ID' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: 200, description: 'Offer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not authorized to access this offer' })
  async getOfferById(@Param('id') id: string, @Req() req: express.Request) {
    const userId = (req as any).user?._id?.toString() as string;
    const userRoles = (req as any).user?.roles || [];
    return this.recruitmentService.findOfferById(id, userId, userRoles);
  }

  @Patch('offers/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Update offer details', description: 'Updates offer details such as compensation, benefits, content, deadline' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: 200, description: 'Offer updated successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async updateOffer(@Param('id') id: string, @Body() updateDto: any) {
    return this.recruitmentService.updateOffer(id, updateDto);
  }

  @Patch('offers/:id/response')
  @Roles(SystemRole.JOB_CANDIDATE, SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Update candidate response', description: 'Updates the candidate response to an offer (accepted, rejected, pending)' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiBody({ type: UpdateOfferStatusDto })
  @ApiResponse({ status: 200, description: 'Offer response updated successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not authorized to update this offer' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async updateOfferResponse(@Param('id') id: string, @Body() responseDto: UpdateOfferStatusDto, @Req() req: express.Request) {
    const userId = (req as any).user?._id?.toString() as string;
    const userRoles = (req as any).user?.roles || [];
    return this.recruitmentService.updateOfferResponse(id, responseDto.applicantResponse, userId, userRoles);
  }

  @Patch('offers/:id/approval')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
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
  @Roles(SystemRole.JOB_CANDIDATE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.HR_EMPLOYEE, SystemRole.DEPARTMENT_HEAD, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Sign offer', description: 'Signs an offer letter (candidate, HR, or manager signature)' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: 200, description: 'Offer signed successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async signOffer(@Param('id') id: string, @Body() signDto: any, @Req() req: any) {
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0] || 'unknown';
    const userId = (req as any).user?._id?.toString() || (req as any).user?.sub?.toString();
    const userRoles = (req as any).user?.roles || [];
    return this.recruitmentService.signOffer(
      id,
      signDto.signerType,
      signDto.typedName,
      ipAddress,
      signDto.token,
      userId,
      userRoles,
    );
  }

  @Get('offers/:id/validate-token')
  @Public()
  @ApiOperation({ summary: 'Validate offer signing token', description: 'Public endpoint to validate a signing token for an offer' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async validateOfferToken(@Param('id') id: string, @Query('token') token: string, @Query('signerType') signerType: string) {
    const offer = await this.recruitmentService.validateOfferSigningToken(id, token, signerType);
    const candidate = await this.recruitmentService['candidateModel'].findById(offer.candidateId).exec();
    return {
      valid: true,
      offer: {
        _id: offer._id,
        role: offer.role,
        grossSalary: offer.grossSalary,
        signingBonus: offer.signingBonus,
        benefits: offer.benefits,
        deadline: offer.deadline,
        content: offer.content,
      },
      candidate: candidate ? {
        fullName: candidate.fullName || `${candidate.firstName} ${candidate.lastName}`,
        personalEmail: candidate.personalEmail,
      } : null,
    };
  }

  @Post('offers/:id/sign-public')
  @Public()
  @ApiOperation({ summary: 'Public offer signing', description: 'Public endpoint for candidates to sign offers using a token' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: 200, description: 'Offer signed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token or validation error' })
  async signOfferPublic(@Param('id') id: string, @Body() signDto: any, @Req() req: any) {
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0] || 'unknown';
    if (!signDto.token || !signDto.typedName) {
      throw new BadRequestException('Token and typed name are required');
    }
    return this.recruitmentService.signOffer(
      id,
      signDto.signerType || 'candidate',
      signDto.typedName,
      ipAddress,
      signDto.token,
    );
  }

  @Post('offers/:id/generate-signing-link')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Generate signing link for offer', description: 'Generates a secure signing token and returns the signing URL' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: 200, description: 'Signing link generated successfully' })
  async generateOfferSigningLink(@Param('id') id: string, @Body() body: { signerType: string; expiresInDays?: number }) {
    const token = await this.recruitmentService.generateOfferSigningToken(
      id,
      body.signerType,
      body.expiresInDays || 7,
    );
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5001';
    return {
      token,
      signingUrl: `${baseUrl}/offers/${id}/sign?token=${token}&signerType=${body.signerType}`,
      expiresInDays: body.expiresInDays || 7,
    };
  }

  @Post('offers/:id/generate-pdf')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Generate offer PDF', description: 'Generates a PDF document for the offer letter' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: 200, description: 'Offer PDF generated successfully', content: { 'application/pdf': {} } })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async generateOfferPDF(@Param('id') id: string) {
    return this.recruitmentService.generateOfferPDF(id);
  }

  @Post('offers/:id/send')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Send offer to candidate', description: 'Sends the offer letter to the candidate via email' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: 200, description: 'Offer sent successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async sendOfferToCandidate(@Param('id') id: string) {
    return this.recruitmentService.sendOfferToCandidate(id);
  }

  // ==================== Contract Endpoints ====================

  @Post('contracts')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create contract from accepted offer', description: 'Creates an employment contract from an accepted offer' })
  @ApiBody({ type: CreateContractDto })
  @ApiResponse({ status: 201, description: 'Contract created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createContract(@Body() createDto: CreateContractDto) {
    return this.recruitmentService.createContract(createDto);
  }

  @Get('contracts')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get all contracts', description: 'Retrieves all employment contracts' })
  @ApiQuery({ name: 'offerId', required: false, description: 'Filter by offer ID' })
  @ApiResponse({ status: 200, description: 'List of contracts retrieved successfully' })
  async getContracts(@Query() filters: any) {
    return this.recruitmentService.findAllContracts(filters);
  }

  @Get('contracts/:id')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get contract by ID', description: 'Retrieves a specific contract by its ID' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 200, description: 'Contract retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async getContractById(@Param('id') id: string) {
    return this.recruitmentService.findContractById(id);
  }

  @Patch('contracts/:id/sign')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Sign contract', description: 'Signs a contract (employee or employer signature)' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 200, description: 'Contract signed successfully' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async signContract(@Param('id') id: string, @Body() signDto: any, @Req() req: any) {
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0] || 'unknown';
    return this.recruitmentService.signContract(
      id,
      signDto.signerType,
      signDto.typedName,
      ipAddress,
      signDto.token,
    );
  }

  @Get('contracts/:id/validate-token')
  @Public()
  @ApiOperation({ summary: 'Validate contract signing token', description: 'Public endpoint to validate a signing token for a contract' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async validateContractToken(@Param('id') id: string, @Query('token') token: string, @Query('signerType') signerType: string) {
    const contract = await this.recruitmentService.validateContractSigningToken(id, token, signerType);
    const offer = await this.recruitmentService['offerModel'].findById(contract.offerId).populate('candidateId').exec();
    return {
      valid: true,
      contract: {
        _id: contract._id,
        role: contract.role,
        grossSalary: contract.grossSalary,
        signingBonus: contract.signingBonus,
        benefits: contract.benefits,
        acceptanceDate: contract.acceptanceDate,
      },
      candidate: offer?.candidateId ? {
        fullName: (offer.candidateId as any).fullName || `${(offer.candidateId as any).firstName} ${(offer.candidateId as any).lastName}`,
        personalEmail: (offer.candidateId as any).personalEmail,
      } : null,
    };
  }

  @Post('contracts/:id/sign-public')
  @Public()
  @ApiOperation({ summary: 'Public contract signing', description: 'Public endpoint for employees/employers to sign contracts using a token' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 200, description: 'Contract signed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token or validation error' })
  async signContractPublic(@Param('id') id: string, @Body() signDto: any, @Req() req: any) {
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0] || 'unknown';
    if (!signDto.token || !signDto.typedName) {
      throw new BadRequestException('Token and typed name are required');
    }
    return this.recruitmentService.signContract(
      id,
      signDto.signerType || 'employee',
      signDto.typedName,
      ipAddress,
      signDto.token,
    );
  }

  @Post('contracts/:id/generate-signing-link')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Generate signing link for contract', description: 'Generates a secure signing token and returns the signing URL' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 200, description: 'Signing link generated successfully' })
  async generateContractSigningLink(@Param('id') id: string, @Body() body: { signerType: string; expiresInDays?: number }) {
    const token = await this.recruitmentService.generateContractSigningToken(
      id,
      body.signerType,
      body.expiresInDays || 7,
    );
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5001';
    return {
      token,
      signingUrl: `${baseUrl}/contracts/${id}/sign?token=${token}&signerType=${body.signerType}`,
      expiresInDays: body.expiresInDays || 7,
    };
  }

  @Get('contracts/:id/pdf')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get contract PDF', description: 'Retrieves the contract as a PDF document' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 200, description: 'Contract PDF retrieved successfully', content: { 'application/pdf': {} } })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async getContractPDF(@Param('id') id: string) {
    return this.recruitmentService.generateContractPDF(id);
  }

  @Get('contracts/offer/:offerId')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.JOB_CANDIDATE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get contract by offer ID', description: 'Retrieves a contract associated with a specific offer' })
  @ApiParam({ name: 'offerId', description: 'Offer ID' })
  @ApiResponse({ status: 200, description: 'Contract retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async getContractByOfferId(@Param('offerId') offerId: string) {
    return this.recruitmentService.getContractByOfferId(offerId);
  }

  // ==================== Onboarding Endpoints ====================

  @Get('onboarding')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.HR_EMPLOYEE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get all onboarding records', description: 'Retrieves all onboarding records with optional filtering' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by completion status (completed, pending)' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (ISO string)' })
  @ApiResponse({ status: 200, description: 'Onboarding records retrieved successfully' })
  async getAllOnboardings(
    @Query('status') status?: string,
    @Query('department') department?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.recruitmentService.findAllOnboardings({
      status,
      department,
      startDate,
      endDate,
    });
  }

  @Post('onboarding')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initialize onboarding process', description: 'Creates an onboarding checklist and tasks for a new employee' })
  @ApiBody({ type: CreateOnboardingDto })
  @ApiResponse({ status: 201, description: 'Onboarding process initialized successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createOnboarding(@Body() createDto: CreateOnboardingDto) {
    return this.recruitmentService.createOnboarding(createDto);
  }

  @Get('onboarding/by-id/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.HR_EMPLOYEE, SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get onboarding by ID', description: 'Retrieves onboarding information by onboarding ID' })
  @ApiParam({ name: 'id', description: 'Onboarding ID' })
  @ApiResponse({ status: 200, description: 'Onboarding information retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Onboarding not found' })
  async getOnboardingById(@Param('id') id: string) {
    return this.recruitmentService.findOnboardingById(id);
  }

  @Get('onboarding/:employeeId')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.HR_EMPLOYEE, SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get onboarding by employee ID', description: 'Retrieves onboarding information for a specific employee' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Onboarding information retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Onboarding not found' })
  async getOnboardingByEmployeeId(@Param('employeeId') employeeId: string) {
    return this.recruitmentService.findOnboardingByEmployeeId(employeeId);
  }

  @Patch('onboarding/:id/tasks/:taskId')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.SYSTEM_ADMIN)
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
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Mark onboarding as complete', description: 'Marks the entire onboarding process as completed' })
  @ApiParam({ name: 'id', description: 'Onboarding ID' })
  @ApiResponse({ status: 200, description: 'Onboarding marked as complete' })
  @ApiResponse({ status: 404, description: 'Onboarding not found' })
  async completeOnboarding(@Param('id') id: string) {
    return this.recruitmentService.completeOnboarding(id);
  }

  @Get('onboarding/:id/tasks')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.HR_EMPLOYEE, SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get all onboarding tasks', description: 'Retrieves all tasks for an onboarding process' })
  @ApiParam({ name: 'id', description: 'Onboarding ID' })
  @ApiResponse({ status: 200, description: 'Onboarding tasks retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Onboarding not found' })
  async getOnboardingTasks(@Param('id') id: string) {
    return this.recruitmentService.getOnboardingTasks(id);
  }

  // ==================== Termination Endpoints ====================

  @Post('terminations')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create termination request', description: 'Creates a termination request for an employee (resignation or termination)' })
  @ApiBody({ type: CreateTerminationRequestDto })
  @ApiResponse({ status: 201, description: 'Termination request created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createTerminationRequest(@Body() createDto: CreateTerminationRequestDto) {
    return this.recruitmentService.createTerminationRequest(createDto);
  }

  @Get('terminations')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get all termination requests', description: 'Retrieves all termination requests with optional filtering' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by termination status' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by termination type (resignation, termination)' })
  @ApiResponse({ status: 200, description: 'List of termination requests retrieved successfully' })
  async getTerminationRequests(@Query() filters: any) {
    return this.recruitmentService.findAllTerminationRequests(filters);
  }

  @Get('terminations/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get termination request by ID', description: 'Retrieves a specific termination request by its ID' })
  @ApiParam({ name: 'id', description: 'Termination request ID' })
  @ApiResponse({ status: 200, description: 'Termination request retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Termination request not found' })
  async getTerminationRequestById(@Param('id') id: string) {
    return this.recruitmentService.findTerminationRequestById(id);
  }

  @Patch('terminations/:id/status')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
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
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get clearance checklist', description: 'Retrieves the clearance checklist for a termination request' })
  @ApiParam({ name: 'id', description: 'Termination request ID' })
  @ApiResponse({ status: 200, description: 'Clearance checklist retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Termination request not found' })
  async getClearanceChecklist(@Param('id') id: string) {
    return this.recruitmentService.getClearanceChecklist(id);
  }

  @Patch('terminations/:id/clearance')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
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
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create employee referral', description: 'Creates a referral record when an employee refers a candidate' })
  @ApiBody({ type: CreateReferralDto })
  @ApiResponse({ status: 201, description: 'Referral created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createReferral(@Body() createDto: CreateReferralDto) {
    return this.recruitmentService.createReferral(createDto);
  }

  @Get('referrals')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get all referrals', description: 'Retrieves all employee referrals with optional filtering' })
  @ApiQuery({ name: 'referrerId', required: false, description: 'Filter by referrer employee ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by referral status' })
  @ApiResponse({ status: 200, description: 'List of referrals retrieved successfully' })
  async getReferrals(@Query() filters: any) {
    return this.recruitmentService.findAllReferrals(filters);
  }

  @Get('referrals/:id')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get referral by ID', description: 'Retrieves a specific referral by its ID' })
  @ApiParam({ name: 'id', description: 'Referral ID' })
  @ApiResponse({ status: 200, description: 'Referral retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Referral not found' })
  async getReferralById(@Param('id') id: string) {
    return this.recruitmentService.findReferralById(id);
  }

  @Patch('referrals/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
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
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete referral', description: 'Deletes a referral by ID' })
  @ApiParam({ name: 'id', description: 'Referral ID' })
  @ApiResponse({ status: 204, description: 'Referral deleted successfully' })
  @ApiResponse({ status: 404, description: 'Referral not found' })
  async deleteReferral(@Param('id') id: string) {
    return this.recruitmentService.deleteReferral(id);
  }

  @Post('documents')
  @Public()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = './uploads/documents';
          // Ensure directory exists
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload document', description: 'Uploads a document (resume, certificate, etc.) with metadata. Public endpoint for candidates to upload resumes.' })
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
        type: { type: 'string', description: 'Document type (cv, contract, id, certificate, resignation)' },
        ownerId: { type: 'string', description: 'Owner ID (EmployeeProfile ID, optional)' },
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
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.recruitmentService.createDocument({
      ...documentDto,
      filePath: file.path,
      fileName: file.originalname,
      fileSize: file.size,
    });
  }

  @Get('documents')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.JOB_CANDIDATE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get all documents', description: 'Retrieves all documents with optional filtering' })
  @ApiQuery({ name: 'entityType', required: false, description: 'Filter by entity type (application, candidate, offer, etc.)' })
  @ApiQuery({ name: 'entityId', required: false, description: 'Filter by entity ID' })
  @ApiQuery({ name: 'documentType', required: false, description: 'Filter by document type' })
  @ApiResponse({ status: 200, description: 'List of documents retrieved successfully' })
  async getDocuments(@Query() filters: any) {
    return this.recruitmentService.findAllDocuments(filters);
  }

  @Get('documents/:id')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.JOB_CANDIDATE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get document by ID', description: 'Retrieves document metadata by ID' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocumentById(@Param('id') id: string) {
    return this.recruitmentService.findDocumentById(id);
  }

  @Patch('documents/:id')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.SYSTEM_ADMIN)
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
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete document', description: 'Deletes a document by ID' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 204, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async deleteDocument(@Param('id') id: string) {
    return this.recruitmentService.deleteDocument(id);
  }

  @Get('documents/:id/download')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.JOB_CANDIDATE, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Download document', description: 'Downloads a document file' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document file downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async downloadDocument(@Param('id') id: string) {
    return this.recruitmentService.downloadDocument(id);
  }

  // ==================== Dashboard & Reporting Endpoints ====================

  @Get('dashboard/overview')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get recruitment overview', description: 'Retrieves high-level recruitment statistics and overview data' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (ISO string)' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department' })
  @ApiResponse({ status: 200, description: 'Recruitment overview retrieved successfully' })
  async getRecruitmentOverview(@Query() filters: any) {
    return this.recruitmentService.getRecruitmentOverview(filters);
  }

  @Get('dashboard/metrics')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get recruitment metrics', description: 'Retrieves detailed recruitment metrics (time-to-hire, offer acceptance rate, etc.)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (ISO string)' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department' })
  @ApiResponse({ status: 200, description: 'Recruitment metrics retrieved successfully' })
  async getRecruitmentMetrics(@Query() filters: any) {
    return this.recruitmentService.getRecruitmentMetrics(filters);
  }

  @Get('dashboard/pipeline')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get pipeline view', description: 'Retrieves the recruitment pipeline view showing applications by stage' })
  @ApiQuery({ name: 'requisitionId', required: false, description: 'Filter by job requisition ID' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department' })
  @ApiResponse({ status: 200, description: 'Pipeline view retrieved successfully' })
  async getPipelineView(@Query() filters: any) {
    return this.recruitmentService.getPipelineView(filters);
  }

  @Get('dashboard/requisitions/:id/metrics')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get requisition metrics', description: 'Retrieves metrics for a specific job requisition' })
  @ApiParam({ name: 'id', description: 'Job requisition ID' })
  @ApiResponse({ status: 200, description: 'Requisition metrics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Job requisition not found' })
  async getRequisitionMetrics(@Param('id') id: string) {
    return this.recruitmentService.getRequisitionMetrics(id);
  }

  @Get('dashboard/applications-by-stage')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get applications by stage', description: 'Retrieves application counts grouped by stage for a requisition' })
  @ApiQuery({ name: 'requisitionId', required: false, description: 'Filter by job requisition ID' })
  @ApiResponse({ status: 200, description: 'Applications by stage retrieved successfully' })
  async getApplicationsByStage(@Query() filters: any) {
    return this.recruitmentService.getApplicationsByStage(filters.requisitionId);
  }

  @Get('dashboard/applications-by-status')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.RECRUITER, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get applications by status', description: 'Retrieves application counts grouped by status for a requisition' })
  @ApiQuery({ name: 'requisitionId', required: false, description: 'Filter by job requisition ID' })
  @ApiResponse({ status: 200, description: 'Applications by status retrieved successfully' })
  async getApplicationsByStatus(@Query() filters: any) {
    return this.recruitmentService.getApplicationsByStatus(filters.requisitionId);
  }

  @Get('dashboard/time-to-hire')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
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
