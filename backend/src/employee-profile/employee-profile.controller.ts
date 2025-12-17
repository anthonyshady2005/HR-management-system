/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Patch,
  Body,
  Post,
  Put,
  Delete,
  UseGuards,
  Req,
  Query,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { EmployeeProfileService } from './employee-profile.service';
import { UpdateSelfEmployeeProfileDto } from './dto/update-self-profile.dto';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { SearchEmployeeDto } from './dto/search-employee.dto';
import { HrUpdateEmployeeProfileDto } from './dto/hr-update-employee-profile.dto';
import { CreateEmployeeProfileDto } from './dto/create-employee-profile.dto';
import { ProcessChangeRequestDto } from './dto/process-change-request.dto';
import { DeactivateEmployeeDto } from './dto/deactivate-employee.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { GetChangeRequestsDto } from './dto/get-change-requests.dto';
import { AssignEmployeeToTeamDto } from './dto/assign-employee-to-team.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ActiveEmployeeGuard } from './guards/active-employee.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SystemRole, ProfileChangeStatus } from './enums/employee-profile.enums';
import express from 'express';

@Controller('employee-profile')
export class EmployeeProfileController {
  constructor(private readonly profileService: EmployeeProfileService) {}

  // ========== SELF-SERVICE ENDPOINTS ==========

  @UseGuards(JwtAuthGuard, ActiveEmployeeGuard)
  @Get('me')
  getMe(@Req() req: express.Request) {
    const userId = (req as any).user?.sub as string; // decoded token payload
    return this.profileService.getMyProfile(userId);
  }

  @UseGuards(JwtAuthGuard, ActiveEmployeeGuard)
  @Patch('me')
  updateMe(
    @Req() req: express.Request,
    @Body() dto: UpdateSelfEmployeeProfileDto,
  ) {
    const userId = (req as any).user?.sub as string;
    return this.profileService.updateSelfProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard, ActiveEmployeeGuard)
  @Post('me/change-requests')
  submitChangeRequest(
    @Req() req: express.Request,
    @Body() dto: CreateChangeRequestDto,
  ) {
    const userId = (req as any).user?.sub as string;
    return this.profileService.submitChangeRequest(userId, dto);
  }

  @UseGuards(JwtAuthGuard, ActiveEmployeeGuard)
  @Get('me/change-requests')
  getMyChangeRequests(
    @Req() req: express.Request,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const userId = (req as any).user?.sub as string;
    return this.profileService.getMyChangeRequests(userId, page || 1, limit || 20);
  }

  @UseGuards(JwtAuthGuard, ActiveEmployeeGuard)
  @Get('me/notifications')
  getMyNotifications(
    @Req() req: express.Request,
    @Query('unreadOnly') unreadOnly?: boolean,
  ) {
    const userId = (req as any).user?.sub as string;
    
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    console.log(`[Notifications Controller] Fetching notifications for user: ${userId}, unreadOnly: ${unreadOnly}`);
    
    return this.profileService.getNotifications(userId, unreadOnly === true);
  }

  @UseGuards(JwtAuthGuard, ActiveEmployeeGuard)
  @Patch('me/notifications/:notificationId/read')
  markNotificationAsRead(
    @Req() req: express.Request,
    @Param('notificationId') notificationId: string,
  ) {
    const userId = (req as any).user?.sub as string;
    return this.profileService.markNotificationAsRead(userId, notificationId);
  }

  @UseGuards(JwtAuthGuard, ActiveEmployeeGuard)
  @Patch('me/notifications/read-all')
  markAllNotificationsAsRead(@Req() req: express.Request) {
    const userId = (req as any).user?.sub as string;
    return this.profileService.markAllNotificationsAsRead(userId);
  }

  // ========== MANAGER TEAM VIEW (US-E4-01, US-E4-02) ==========

  /**
   * Get team members reporting to the current manager.
   * BR 41b: Direct managers see their team only.
   * BR 18b: Privacy restrictions applied - sensitive data excluded.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD)
  @Get('manager/team')
  getTeamMembers(@Req() req: express.Request) {
    const userId = (req as any).user?.sub as string;
    return this.profileService.getTeamMembers(userId);
  }

  /**
   * Get summary of team's job titles and departments.
   * US-E4-02: Manager sees aggregated team view.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD)
  @Get('manager/team/summary')
  getTeamSummary(@Req() req: express.Request) {
    const userId = (req as any).user?.sub as string;
    return this.profileService.getTeamSummary(userId);
  }

  /**
   * Manager assigns an employee to their team.
   * Updates the employee's supervisorPositionId to the manager's position.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD)
  @Post('manager/team/add')
  addEmployeeToTeam(
    @Body() dto: AssignEmployeeToTeamDto,
    @Req() req: express.Request,
  ) {
    const managerId = (req as any).user?.sub as string;
    return this.profileService.assignEmployeeToManagerTeam(
      dto.employeeId,
      managerId,
    );
  }

  /**
   * Get a specific team member's profile (privacy-filtered for managers).
   * BR 18b: Managers cannot see sensitive fields (nationalId, payGrade, bankInfo, etc).
   * Managers can only view direct reports.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD)
  @Get('manager/team/:employeeId')
  getTeamMemberProfile(
    @Param('employeeId') employeeId: string,
    @Req() req: express.Request,
  ) {
    const managerId = (req as any).user?.sub as string;
    return this.profileService.getTeamMemberProfile(managerId, employeeId);
  }

  // ========== HR ADMIN SEARCH (US-E6-03) ==========

  /**
   * Search employees by various criteria.
   * Only accessible by HR Admin, HR Manager, HR Employee, and System Admin roles.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.SYSTEM_ADMIN, SystemRole.DEPARTMENT_HEAD)
  @Get('search')
  searchEmployees(@Query() dto: SearchEmployeeDto) {
    return this.profileService.searchEmployees(dto);
  }

  // ========== CHANGE REQUESTS MANAGEMENT ==========

  /**
   * Process (approve/reject) a change request (US-E2-03).
   * BR 22: Processing is audit logged.
   * NOTE: Must be BEFORE /:employeeId routes to avoid path matching conflicts
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Patch('change-requests/:requestId/process')
  processChangeRequest(
    @Param('requestId') requestId: string,
    @Req() req: express.Request,
    @Body() dto: ProcessChangeRequestDto,
  ) {
    const user = (req as any).user;
    if (!user || !user.sub) {
      console.error('[ProcessChangeRequest] User not found in request');
      throw new BadRequestException('User not authenticated properly');
    }
    const hrAdminId = user.sub as string;
    console.log(`[ProcessChangeRequest] RequestID: ${requestId}, AdminID: ${hrAdminId}, DTO:`, JSON.stringify(dto));
    return this.profileService.processChangeRequest(requestId, hrAdminId, dto);
  }

  /**
   * Delete a change request (US-E2-03).
   * Allows HR Admin, HR Manager, and System Admin to delete requests.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Delete('change-requests/:requestId')
  deleteChangeRequest(
    @Param('requestId') requestId: string,
    @Req() req: express.Request,
  ) {
    const userId = (req as any).user?.sub as string;
    return this.profileService.deleteChangeRequest(requestId, userId);
  }

  // Legacy route support (tests referencing PUT without /process)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Put('change-requests/:requestId')
  legacyProcessChangeRequest(
    @Param('requestId') requestId: string,
    @Req() req: express.Request,
    @Body() dto: ProcessChangeRequestDto,
  ) {
    const hrAdminId = (req as any).user?.sub as string;
    return this.profileService.processChangeRequest(requestId, hrAdminId, dto);
  }

  /**
   * Get all change requests for HR approval (US-E2-03).
   * NOTE: Must be BEFORE /:employeeId routes to avoid path matching conflicts
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Get('change-requests')
  getAllChangeRequests(@Query() dto: GetChangeRequestsDto) {
    // Parse and validate page
    const page = dto.page || 1;

    // Parse and validate limit
    const limit = dto.limit || 20;

    // Parse and validate status
    let status: ProfileChangeStatus | undefined = undefined;
    if (dto.status && dto.status !== '' && dto.status !== 'ALL' && dto.status !== 'undefined') {
      const upperStatus = String(dto.status).toUpperCase();
      if (Object.values(ProfileChangeStatus).includes(upperStatus as ProfileChangeStatus)) {
        status = upperStatus as ProfileChangeStatus;
      }
    }
    
    return this.profileService.getAllChangeRequests(page, limit, status);
  }

  /**
   * Get pending change requests for HR approval (US-E2-03).
   * @deprecated Use GET /change-requests?status=PENDING instead
   * NOTE: Must be BEFORE /:employeeId routes to avoid path matching conflicts
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Get('change-requests/pending')
  getPendingChangeRequests(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.profileService.getPendingChangeRequests(page || 1, limit || 20);
  }

  // ========== HR ADMIN MASTER DATA MANAGEMENT ==========

  /**
   * Create a new employee profile (HR Admin only).
   * Can assign employee to a team via supervisorPositionId.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Post()
  createEmployee(
    @Req() req: express.Request,
    @Body() dto: CreateEmployeeProfileDto,
  ) {
    const hrAdminId = (req as any).user?.sub as string;
    return this.profileService.createEmployeeProfile(hrAdminId, dto);
  }

  /**
   * Get employee profile by ID (US-EP-04).
   * Full access for HR Admin.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Get(':employeeId')
  getEmployeeById(@Param('employeeId') employeeId: string) {
    return this.profileService.getEmployeeById(employeeId);
  }

  /**
   * HR Admin update employee profile (US-EP-04).
   * BR 20a: Only authorized roles can modify data.
   * BR 22: All changes are audit logged.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Patch(':employeeId')
  hrUpdateEmployee(
    @Param('employeeId') employeeId: string,
    @Req() req: express.Request,
    @Body() dto: HrUpdateEmployeeProfileDto,
  ) {
    const hrAdminId = (req as any).user?.sub as string;
    return this.profileService.hrUpdateEmployeeProfile(employeeId, hrAdminId, dto);
  }


  /**
   * Deactivate employee profile (US-EP-05).
   * PERMANENTLY DELETES the employee account and all related records.
   * For termination, resignation, retirement, or account removal.
   * BR 3j: Employee status for system access control.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Post(':employeeId/deactivate')
  deactivateEmployee(
    @Param('employeeId') employeeId: string,
    @Req() req: express.Request,
    @Body() dto: DeactivateEmployeeDto,
  ) {
    const hrAdminId = (req as any).user?.sub as string;
    return this.profileService.deactivateEmployee(employeeId, hrAdminId, dto);
  }

  /**
   * Assign roles and permissions to employee (US-E7-05).
   * BR 20a: Only authorized roles can modify access.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Post(':employeeId/roles')
  assignRoles(
    @Param('employeeId') employeeId: string,
    @Req() req: express.Request,
    @Body() dto: AssignRolesDto,
  ) {
    const hrAdminId = (req as any).user?.sub as string;
    return this.profileService.assignRoles(employeeId, hrAdminId, dto);
  }

  /**
   * Get employee roles.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Get(':employeeId/roles')
  getEmployeeRoles(@Param('employeeId') employeeId: string) {
    return this.profileService.getEmployeeRoles(employeeId);
  }

  /**
   * Get audit history for an employee (BR 22).
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Get(':employeeId/audit-history')
  getAuditHistory(
    @Param('employeeId') employeeId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.profileService.getAuditHistory(employeeId, page || 1, limit || 50);
  }
}
