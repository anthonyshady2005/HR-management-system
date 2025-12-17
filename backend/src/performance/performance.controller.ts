import { Controller, Post, Body, UseGuards, Get, Put, Param } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { CreateAppraisalTemplateDto } from './DTOs/CreateAppraisalTemplate.dto';
import { AppraisalTemplate } from './models/appraisal-template.schema';
import { CreateAppraisalCycleDTO } from './DTOs/CreateAppraisalCycle.dto';
import { AppraisalCycle } from './models/appraisal-cycle.schema';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
import { CreateAppraisalAssignmentDTO } from './DTOs/CreateAppraisalAssignment.dto';
import { AppraisalAssignment } from './models/appraisal-assignment.schema';
import { AppraisalRecord } from './models/appraisal-record.schema';
import { CreateAppraisalRecordDTO } from './DTOs/CreateAppraisalRecord.dto';
import { UpdateAppraisalRecordDto } from './DTOs/UpdateAppraisalRecord.dto';
import { AppraisalDispute } from './models/appraisal-dispute.schema';
import { CreateAppraisalDisputeDTO } from './DTOs/CreateAppraisalDispute.dto';
import { UpdateAppraisalDisputeDto } from './DTOs/UpdateAppraisalDispute.dto';
import { Types } from 'mongoose';

@ApiTags('Performance')
@Controller('performance')
@UseGuards(JwtAuthGuard, RolesGuard) // Protect all routes in this controller
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) { }

  // Create a new appraisal template(Req 1)
  @Post('template')
  @Roles(SystemRole.HR_MANAGER) // Only HR Manager/Admin
  @ApiOperation({ summary: 'Create a new appraisal template' })
  @ApiResponse({ status: 201, description: 'Appraisal template created successfully', type: AppraisalTemplate })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createAppraisalTemplate(
    @Body() dto: CreateAppraisalTemplateDto
  ): Promise<AppraisalTemplate> {
    return this.performanceService.createTemplate(dto);
  }

  // Get all appraisal templates
  @Get('templates')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  @ApiOperation({ summary: 'Get all appraisal templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully', type: [AppraisalTemplate] })
  async getAllTemplates(): Promise<AppraisalTemplate[]> {
    return this.performanceService.getAllTemplates();
  }

  // Get specific template
  @Get('templates/:id')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  @ApiOperation({ summary: 'Get template by ID' })
  async getTemplateById(@Param('id') id: string): Promise<AppraisalTemplate> {
    return this.performanceService.getTemplateById(id);
  }

  // Get specific assignment
  @Get('assignments/:id')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_EMPLOYEE)
  @ApiOperation({ summary: 'Get assignment by ID' })
  async getAssignmentById(@Param('id') id: string): Promise<AppraisalAssignment> {
    return this.performanceService.getAssignmentById(id);
  }

  // Create a new appraisal cycle (Req 2)
  @Post('cycle')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER) // HR Manager & Department Head
  @ApiOperation({ summary: 'Create a new appraisal cycle' })
  @ApiResponse({ status: 201, description: 'Appraisal cycle created successfully', type: AppraisalCycle })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createAppraisalCycle(
    @Body() dto: CreateAppraisalCycleDTO
  ): Promise<AppraisalCycle> {
    return this.performanceService.createCycle(dto);
  }
  // Get all appraisal cycles
@Get('cycles')
@Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
@ApiOperation({ summary: 'Get all appraisal cycles' })
@ApiResponse({ status: 200, description: 'All cycles retrieved successfully', type: [AppraisalCycle] })
async getAllCycles(): Promise<AppraisalCycle[]> {
  return this.performanceService.getAllCycles();
}

  // Get active appraisal cycles
  @Get('cycles/active')
@Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
@ApiOperation({ summary: 'Get currently active appraisal cycles' })
@ApiResponse({ status: 200, description: 'Active cycles retrieved successfully', type: [AppraisalCycle] })
async getActiveCycles(): Promise<AppraisalCycle[]> {
  return this.performanceService.getActiveCycles();
}

  // Update cycle status (close/archive cycles)
  @Put('cycles/:cycleId/status')
  @Roles(SystemRole.HR_MANAGER)
  @ApiOperation({ summary: 'Update appraisal cycle status' })
  @ApiResponse({ status: 200, description: 'Cycle status updated successfully' })
  @ApiResponse({ status: 404, description: 'Cycle not found' })
  async updateCycleStatus(
    @Param('cycleId') cycleId: string,
    @Body('status') status: string,
  ): Promise<AppraisalCycle> {
    return this.performanceService.updateCycleStatus(cycleId, status);
  }

  // Assign appraisal template/cycle to employees and managers in bulk (Req 3)
  @Post('assignments/bulk')
  @Roles(SystemRole.HR_EMPLOYEE) // HR Employee
  @ApiOperation({ summary: 'Assign appraisal templates/cycles to employees and managers in bulk' })
  @ApiResponse({ status: 201, description: 'Appraisal assignments created successfully', type: [AppraisalCycle] })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async assignAppraisalsBulk(
    @Body() dtos: CreateAppraisalAssignmentDTO[], // Replace 'any' with the actual DTO type
  ): Promise<AppraisalAssignment[]> { // Replace 'any' with the actual return type
    return this.performanceService.assignAppraisalsBulk(dtos);
  }
  // Get all appraisal assignments for a specific manager (Req 4)
  @Get('assignments/manager/:managerId')
  @Roles(SystemRole.DEPARTMENT_HEAD) // Authorized roles
  @ApiOperation({ summary: 'Get all appraisal assignments for a specific manager' })
  @ApiResponse({ status: 200, description: 'Appraisal assignments retrieved successfully', type: [AppraisalAssignment] })
  @ApiResponse({ status: 400, description: 'Invalid manager ID' })
  async getAssignmentsForManager(
    @Param('managerId') managerId: string,
  ): Promise<AppraisalAssignment[]> {
    return this.performanceService.getAssignmentsForManager(managerId);
  }

  // Get all appraisal assignments
  @Get('assignments')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  @ApiOperation({ summary: 'Get all appraisal assignments' })
  @ApiResponse({ status: 200, description: 'Assignments retrieved successfully', type: [AppraisalAssignment] })
  async getAllAssignments(): Promise<AppraisalAssignment[]> {
    return this.performanceService.getAllAssignments();
  }

  // REQ-AE-03: Create appraisal record (Req 5)
  @Post('record')
  @Roles(SystemRole.DEPARTMENT_HEAD) // Authorized roles
  @ApiOperation({ summary: 'Create a new appraisal record' })
  @ApiResponse({ status: 201, description: 'Appraisal record created successfully', type: AppraisalRecord })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createAppraisalRecord(
    @Body() dto: CreateAppraisalRecordDTO
  ): Promise<AppraisalRecord> {
    return this.performanceService.createAppraisalRecord(dto);
  }
  @Get('records')
  @ApiOperation({ summary: 'Get all appraisal records' })
  @ApiResponse({ status: 200, description: 'List of all appraisal records', type: [AppraisalRecord] })
  async getRecords(): Promise<AppraisalRecord[]> {
    return this.performanceService.getRecords();
  }
  // REQ-AE-03: Update appraisal record (Req 6)
  @Put('record/:recordId')
  @Roles(SystemRole.DEPARTMENT_HEAD) // Authorized roles
  @ApiOperation({ summary: 'Update an appraisal record' })
  @ApiResponse({ status: 200, description: 'Appraisal record updated successfully', type: AppraisalRecord })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async updateAppraisalRecord(
    @Param('recordId') recordId: string,
    @Body() dto: UpdateAppraisalRecordDto,
  ): Promise<AppraisalRecord> {
    return this.performanceService.updateAppraisalRecord(recordId, dto);
  }

  // Dashboard data aggregation (Req 7)
  @Get('hr/dashboard/:cycleId')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get dashboard data for a specific appraisal cycle' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid cycle ID' })
  async getDashboard(
    @Param('cycleId') cycleId: string,
  ) {
    return this.performanceService.getDashboard(cycleId);
  }


  // Monitor appraisal progress and get pending forms (Req 8)
  @Get('pending/:cycleId')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER)
  @ApiOperation({ summary: 'Monitor appraisal progress and get pending forms for a cycle' })
  @ApiResponse({ status: 200, description: 'Appraisal progress retrieved successfully', type: [AppraisalAssignment] })
  @ApiResponse({ status: 400, description: 'Invalid cycle ID' })
 async getPendingAppraisals(
  @Param('cycleId') cycleId: string,
): Promise<AppraisalAssignment[]> {
  return this.performanceService.getPendingAppraisals(cycleId);
}
@Post('reminder/:assignmentId')
@Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER)
async sendReminder(@Param('assignmentId') assignmentId: string) {
  return this.performanceService.sendReminder(new Types.ObjectId(assignmentId));
}

  // REQ-OD-01: View final ratings, feedback, and development notes (Req 9)
  @Get('employee/:employeeId/appraisals')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  @ApiOperation({ summary: 'View final ratings, feedback, and development notes' })
  @ApiResponse({ status: 200, description: 'Appraisals retrieved successfully', type: [AppraisalRecord] })
  @ApiResponse({ status: 400, description: 'Invalid employee ID' })
  async getEmployeeAppraisals(
    @Param('employeeId') employeeId: string,
  ): Promise<AppraisalRecord[]> {
    return this.performanceService.getEmployeeAppraisals(employeeId);
  }

  // REQ-AE-07: Flag or raise a concern about a rating (Req 10)
  @Post('dispute')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.HR_EMPLOYEE)
  @ApiOperation({ summary: 'Flag or raise a concern about a rating' })
  @ApiResponse({ status: 201, description: 'Dispute created successfully', type: AppraisalDispute })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createAppraisalDispute(
    @Body() dto: CreateAppraisalDisputeDTO,
  ): Promise<AppraisalDispute> {
    return this.performanceService.createAppraisalDispute(dto);
  }

  // REQ-AE-07: Update dispute status (Req 11)
  @Put('dispute/:disputeId')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER)
  @ApiOperation({ summary: 'Update dispute status' })
  @ApiResponse({ status: 200, description: 'Dispute updated successfully', type: AppraisalDispute })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async updateAppraisalDispute(
    @Param('disputeId') disputeId: string,
    @Body() dto: UpdateAppraisalDisputeDto,
  ): Promise<AppraisalDispute> {
    return this.performanceService.updateAppraisalDispute(disputeId, dto);
  }

  // REQ-OD-07: Get all disputes for HR Manager to resolve (Req 12)
  @Get('disputes')
  @Roles(SystemRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get all disputes for HR Manager to resolve' })
  @ApiResponse({ status: 200, description: 'Disputes retrieved successfully', type: [AppraisalDispute] })
  async getAllDisputes(): Promise<AppraisalDispute[]> {
    return this.performanceService.getAllDisputes();
  }

  // Publish appraisal and update employee profile (Step 4)
  @Post('record/:recordId/publish')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER)
  @ApiOperation({ summary: 'Publish appraisal and automatically update employee profile' })
  @ApiResponse({ status: 200, description: 'Appraisal published successfully', type: AppraisalRecord })
  @ApiResponse({ status: 400, description: 'Invalid record ID' })
  async publishAppraisal(
    @Param('recordId') recordId: string,
    @Body('publishedByEmployeeId') publishedByEmployeeId: string,
  ): Promise<AppraisalRecord> {
    return this.performanceService.publishAppraisal(recordId, publishedByEmployeeId);
  }

  // REQ-OD-08: Access past appraisal history and multi-cycle trend views (Req 13)
  @Get('employee/:employeeId/history')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER)
  @ApiOperation({ summary: 'Access past appraisal history and multi-cycle trend views' })
  @ApiResponse({ status: 200, description: 'Appraisal history retrieved successfully', type: [AppraisalRecord] })
  @ApiResponse({ status: 400, description: 'Invalid employee ID' })
  async getEmployeeAppraisalHistory(
    @Param('employeeId') employeeId: string,
  ): Promise<AppraisalRecord[]> {
    return this.performanceService.getEmployeeAppraisalHistory(employeeId);
  }

  // REQ-OD-06: Generate and export outcome reports (Req 14)
  @Get('report/:cycleId')
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER)
  @ApiOperation({ summary: 'Generate and export outcome reports' })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid cycle ID' })
  async generateAppraisalReport(
    @Param('cycleId') cycleId: string,
  ) {
    return this.performanceService.generateAppraisalReport(cycleId);
  }
}
