/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Patch,
  Body,
  Post,
  Put,
  UseGuards,
  Req,
  Query,
  Param,
} from '@nestjs/common';
import { EmployeeProfileService } from './employee-profile.service';
import { UpdateSelfEmployeeProfileDto } from './dto/update-self-profile.dto';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { SearchEmployeeDto } from './dto/search-employee.dto';
import { HrUpdateEmployeeProfileDto } from './dto/hr-update-employee-profile.dto';
import { ProcessChangeRequestDto } from './dto/process-change-request.dto';
import { DeactivateEmployeeDto } from './dto/deactivate-employee.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ActiveEmployeeGuard } from './guards/active-employee.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SystemRole } from './enums/employee-profile.enums';
import express from 'express';

@Controller('employee-profile')
export class EmployeeProfileController {
  constructor(private readonly profileService: EmployeeProfileService) { }

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

  // ========== HR ADMIN SEARCH (US-E6-03) ==========

  /**
   * Search employees by various criteria.
   * Only accessible by HR Admin, HR Manager, HR Employee roles.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.SYSTEM_ADMIN)
  @Get('search')
  searchEmployees(@Query() dto: SearchEmployeeDto) {
    return this.profileService.searchEmployees(dto);
  }

  // ========== HR ADMIN MASTER DATA MANAGEMENT ==========

  /**
   * Get employee profile by ID (US-EP-04).
   * Full access for HR Admin.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
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
  @Roles(SystemRole.HR_ADMIN)
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
   * Get pending change requests for HR approval (US-E2-03).
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  @Get('change-requests/pending')
  getPendingChangeRequests(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.profileService.getPendingChangeRequests(page || 1, limit || 20);
  }

  /**
   * Process (approve/reject) a change request (US-E2-03).
   * BR 22: Processing is audit logged.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  @Patch('change-requests/:requestId/process')
  processChangeRequest(
    @Param('requestId') requestId: string,
    @Req() req: express.Request,
    @Body() dto: ProcessChangeRequestDto,
  ) {
    const hrAdminId = (req as any).user?.sub as string;
    return this.profileService.processChangeRequest(requestId, hrAdminId, dto);
  }

  // Legacy route support (tests referencing PUT without /process)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
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
   * Deactivate employee profile (US-EP-05).
   * For termination, resignation, retirement.
   * BR 3j: Employee status for system access control.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
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
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
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
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @Get(':employeeId/audit-history')
  getAuditHistory(
    @Param('employeeId') employeeId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.profileService.getAuditHistory(employeeId, page || 1, limit || 50);
  }
}
