import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';

import { TimeManagementService } from './time-management.service';

// Guards & Decorators
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

// System Roles Enum
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';

// DTOs
import { AttendanceRecordCreateDTO } from './dto/attendance-record-create.dto';
import { AttendanceRecordUpdateDTO } from './dto/attendance-record-update.dto';

import { AttendanceCorrectionRequestCreateDTO } from './dto/attendance-correction-request-create.dto';
import { AttendanceCorrectionRequestUpdateDTO } from './dto/attendance-correction-request-update.dto';

import { ShiftCreateDTO } from './dto/shift-create.dto';
import { ShiftUpdateDTO } from './dto/shift-update.dto';

import { ShiftAssignmentCreateDTO } from './dto/shift-assignment-create.dto';
import { ShiftAssignmentUpdateDTO } from './dto/shift-assignment-update.dto';

import { ScheduleRuleCreateDTO } from './dto/schedule-rule-create.dto';
import { ScheduleRuleUpdateDTO } from './dto/schedule-rule-update.dto';

import { ShiftTypeCreateDTO } from './dto/shift-type-create.dto';
import { ShiftTypeUpdateDTO } from './dto/shift-type-update.dto';

import { LatenessRuleCreateDTO } from './dto/lateness-rule-create.dto';
import { LatenessRuleUpdateDTO } from './dto/lateness-rule-update.dto';

import { OvertimeRuleCreateDTO } from './dto/overtime-rule-create.dto';
import { OvertimeRuleUpdateDTO } from './dto/overtime-rule-update.dto';

import { TimeExceptionCreateDTO } from './dto/time-exception-create.dto';
import { TimeExceptionUpdateDTO } from './dto/time-exception-update.dto';

import { HolidayCreateDTO } from './dto/holiday-create.dto';
import { HolidayUpdateDTO } from './dto/holiday-update.dto';

import { NotificationLogCreateDTO } from './dto/notification-log-create.dto';
import { NotificationLogUpdateDTO } from './dto/notification-log-update.dto';

import { Types } from 'mongoose';
import { CorrectionRequestStatus, TimeExceptionStatus } from './models/enums';

@Controller('time-management')
export class TimeManagementController {
  constructor(
    private readonly timeManagementService: TimeManagementService,
  ) {}

  // ================================================
  // USER STORY 1 — SHIFT ASSIGNMENT MANAGEMENT
  // ================================================

  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_ADMIN,
  )
  @Post('shift-assignments/employee')
  assignShiftToEmployee(@Body() dto: ShiftAssignmentCreateDTO) {
    return this.timeManagementService.assignShiftToEmployee(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_ADMIN,
  )
  @Post('shift-assignments/department/:departmentId')
  assignShiftToDepartment(
    @Param('departmentId') departmentId: string,
    @Body() dto: ShiftAssignmentCreateDTO,
  ) {
    const deptObjId = new Types.ObjectId(departmentId);
    return this.timeManagementService.assignShiftToDepartment(
      deptObjId,
      dto,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_ADMIN,
  )
  @Post('shift-assignments/position/:positionId')
  assignShiftToPosition(
    @Param('positionId') positionId: string,
    @Body() dto: ShiftAssignmentCreateDTO,
  ) {
    const posObjId = new Types.ObjectId(positionId);
    return this.timeManagementService.assignShiftToPosition(
      posObjId,
      dto,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_ADMIN,
  )
  @Patch('shift-assignments/:id')
  updateShiftAssignment(
    @Param('id') id: string,
    @Body() dto: ShiftAssignmentUpdateDTO,
  ) {
    return this.timeManagementService.updateShiftAssignment(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  @Post('shift-assignments/expire')
  expireShiftAssignmentsAutomatically() {
    return this.timeManagementService.expireShiftAssignmentsAutomatically();
  }

  // ================================================
  // USER STORY 2 — SHIFT CONFIGURATION & TYPES
  // BR-TM-03, BR-TM-04
  // ================================================

  // ------------------------------
  // SHIFT TYPES
  // ------------------------------

  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
  )
  @Post('shift-types')
  createShiftType(@Body() dto: ShiftTypeCreateDTO) {
    return this.timeManagementService.createShiftType(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
  )
  @Get('shift-types')
  getAllShiftTypes() {
    return this.timeManagementService.getAllShiftTypes();
  }

  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
  )
  @Patch('shift-types/:id')
  updateShiftType(
    @Param('id') id: string,
    @Body() dto: ShiftTypeUpdateDTO,
  ) {
    return this.timeManagementService.updateShiftType(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
  )
  @Delete('shift-types/:id')
  deactivateShiftType(@Param('id') id: string) {
    return this.timeManagementService.deactivateShiftType(id);
  }

  // ------------------------------
  // SHIFTS (ACTUAL SHIFT DEFINITIONS)
  // ------------------------------

  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
  )
  @Post('shifts')
  createShift(@Body() dto: ShiftCreateDTO) {
    return this.timeManagementService.createShift(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
  )
  @Get('shifts')
  getAllShifts() {
    return this.timeManagementService.getAllShifts();
  }

  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
  )
  @Patch('shifts/:id')
  updateShift(
    @Param('id') id: string,
    @Body() dto: ShiftUpdateDTO,
  ) {
    return this.timeManagementService.updateShift(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
  )
  @Delete('shifts/:id')
  deactivateShift(@Param('id') id: string) {
    return this.timeManagementService.deactivateShift(id);
  }

  // ================================================
// USER STORY 3 — CUSTOM SCHEDULING RULES
// ================================================

@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
)
@Post('schedule-rules')
createScheduleRule(@Body() dto: ScheduleRuleCreateDTO) {
  return this.timeManagementService.createScheduleRule(dto);
}

@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
)
@Get('schedule-rules')
getAllScheduleRules() {
  return this.timeManagementService.getAllScheduleRules();
}

@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
)
@Patch('schedule-rules/:id')
updateScheduleRule(
  @Param('id') id: string,
  @Body() dto: ScheduleRuleUpdateDTO,
) {
  return this.timeManagementService.updateScheduleRule(id, dto);
}

@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
)
@Delete('schedule-rules/:id')
deactivateScheduleRule(@Param('id') id: string) {
  return this.timeManagementService.deactivateScheduleRule(id);
}
// ================================================
// USER STORY 4 — SHIFT EXPIRY NOTIFICATIONS
// ================================================

@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_ADMIN,
)
@Post('shift-assignments/notify-expiry')
notifyUpcomingShiftExpiry(@Query('daysBefore') daysBefore?: string) {
  const days = daysBefore ? Number(daysBefore) : undefined;
  return this.timeManagementService.notifyUpcomingShiftExpiry(days);
}

@UseGuards(RolesGuard)
@Roles(SystemRole.SYSTEM_ADMIN)
@Post('shift-assignments/expiry-cycle')
handleShiftExpiryCron() {
  return this.timeManagementService.handleShiftExpiryCron();
}

// ================================================
// USER STORY 5 — CLOCK-IN / CLOCK-OUT
// ================================================

@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_ADMIN,
  SystemRole.PAYROLL_SPECIALIST,
)
@Post('attendance/external-punch')
logPunchFromExternalSheet(@Body() input: any) {
  return this.timeManagementService.logPunchFromExternalSheet(input);
}

@UseGuards(RolesGuard)
@Roles(
  SystemRole.DEPARTMENT_EMPLOYEE,
  SystemRole.DEPARTMENT_HEAD,
  SystemRole.HR_EMPLOYEE,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
  SystemRole.SYSTEM_ADMIN,
)
@Post('attendance/clock-in')
clockIn(@Body('employeeIdentifier') employeeIdentifier: string) {
  return this.timeManagementService.clockIn(employeeIdentifier);
}

@UseGuards(RolesGuard)
@Roles(
  SystemRole.DEPARTMENT_EMPLOYEE,
  SystemRole.DEPARTMENT_HEAD,
  SystemRole.HR_EMPLOYEE,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
  SystemRole.SYSTEM_ADMIN,
)
@Post('attendance/clock-out')
clockOut(@Body('employeeIdentifier') employeeIdentifier: string) {
  return this.timeManagementService.clockOut(employeeIdentifier);
}

// ================================================
// USER STORY 6 — MANUAL ATTENDANCE CORRECTION
// ================================================

@UseGuards(RolesGuard)
@Roles(
  SystemRole.DEPARTMENT_HEAD,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
  SystemRole.SYSTEM_ADMIN,
)
@Post('attendance/manual-corrections')
correctAttendance(@Body() input: any) {
  return this.timeManagementService.correctAttendance(input);
}
// ================================================
// USER STORY 7 — FLEXIBLE PUNCH HANDLING
// ================================================



// ================================================
// USER STORY 8 — MISSED PUNCH MANAGEMENT
// ================================================




// ================================================
// USER STORY 9 — ATTENDANCE → PAYROLL SYNC
// ================================================

@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_ADMIN,
  SystemRole.PAYROLL_SPECIALIST,
)
@Post('attendance/sync/payroll')
syncAttendanceWithPayroll() {
  return this.timeManagementService.runDailyPayrollSync();
}
// ================================================
// USER STORY 10 — OVERTIME & SHORT TIME CONFIGURATION
// ================================================

@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
)
@Post('overtime-rules')
createOvertimeRule(@Body() dto: any) {
  return this.timeManagementService.createOvertimeRule(dto);
}

@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
)
@Patch('overtime-rules/:ruleId')
updateOvertimeRule(
  @Param('ruleId') ruleId: string,
  @Body() dto: any,
) {
  return this.timeManagementService.updateOvertimeRule(
    new Types.ObjectId(ruleId),
    dto,
  );
}

@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
)
@Post('overtime-rules/:ruleId/approve')
approveOvertimeRule(@Param('ruleId') ruleId: string) {
  return this.timeManagementService.approveOvertimeRule(
    new Types.ObjectId(ruleId),
  );
}

@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
)
@Post('overtime-rules/:ruleId/toggle')
toggleOvertimeRule(
  @Param('ruleId') ruleId: string,
  @Body('activate') activate: boolean,
) {
  return this.timeManagementService.toggleOvertimeRule(
    new Types.ObjectId(ruleId),
    activate,
  );
}

@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
  SystemRole.PAYROLL_SPECIALIST,
)
@Get('overtime-rules')
listOvertimeRules(@Query() filter: any) {
  return this.timeManagementService.listOvertimeRules(filter);
}
// ================================================
// USER STORY 11 — LATENESS & PENALTY RULE MANAGEMENT
// ================================================

@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
)
@Post('lateness-rules')
createLatenessRule(@Body() dto: any) {
  return this.timeManagementService.createLatenessRule(dto);
}

@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
)
@Patch('lateness-rules/:ruleId')
updateLatenessRule(
  @Param('ruleId') ruleId: string,
  @Body() dto: any,
) {
  return this.timeManagementService.updateLatenessRule(
    new Types.ObjectId(ruleId),
    dto,
  );
}

@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
)
@Post('lateness-rules/:ruleId/toggle')
toggleLatenessRule(
  @Param('ruleId') ruleId: string,
  @Body('activate') activate: boolean,
) {
  return this.timeManagementService.toggleLatenessRule(
    new Types.ObjectId(ruleId),
    activate,
  );
}

@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
  SystemRole.PAYROLL_SPECIALIST,
)
@Get('lateness-rules')
listLatenessRules(@Query() filter: any) {
  return this.timeManagementService.listLatenessRules(filter);
}
// ================================================
// USER STORY 12 — REPEATED LATENESS HANDLING
// ================================================

@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
  SystemRole.DEPARTMENT_HEAD,
)
@Get('lateness/repeated/:employeeId')
getRepeatedLatenessCount(
  @Param('employeeId') employeeId: string,
  @Query('days') days?: string,
) {
  const period = days ? Number(days) : 30;
  return this.timeManagementService.countLatenessExceptions(
    new Types.ObjectId(employeeId),
    period,
  );
}

@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
  SystemRole.DEPARTMENT_HEAD,
)
@Post('lateness/handle')
async handleRepeatedLatenessManually(@Body() input: {
  attendanceRecordId: string;
  shiftStartTime: string;
}) {
  const attendance = await this.timeManagementService.getAttendanceRecordById(
    new Types.ObjectId(input.attendanceRecordId),
  );

  return this.timeManagementService.handleRepeatedLateness(
    attendance,
    input.shiftStartTime,
  );
}
// ================================================
// USER STORY 13 — ATTENDANCE CORRECTION REQUESTS
// ================================================

// 1) Employee submits a correction request
@UseGuards(RolesGuard)
@Roles(
  SystemRole.DEPARTMENT_EMPLOYEE,
  SystemRole.HR_EMPLOYEE,
  SystemRole.HR_MANAGER,
  SystemRole.SYSTEM_ADMIN,
)
@Post('attendance-corrections')
submitAttendanceCorrectionRequest(@Body() dto: any) {
  return this.timeManagementService.submitAttendanceCorrectionRequest({
    employeeId: new Types.ObjectId(dto.employeeId),
    attendanceRecordId: new Types.ObjectId(dto.attendanceRecordId),
    reason: dto.reason,
  });
}

// 2) Employee checks their correction requests
@UseGuards(RolesGuard)
@Roles(
  SystemRole.DEPARTMENT_EMPLOYEE,
  SystemRole.HR_EMPLOYEE,
  SystemRole.HR_MANAGER,
  SystemRole.SYSTEM_ADMIN,
)
@Get('attendance-corrections/my/:employeeId')
getMyCorrectionRequests(@Param('employeeId') employeeId: string) {
  return this.timeManagementService.getMyCorrectionRequests(
    new Types.ObjectId(employeeId),
  );
}

// ================================================
// USER STORY 13 — ATTENDANCE CORRECTION REQUESTS
// ================================================

// 3) Manager reviews (approve / reject)
@UseGuards(RolesGuard)
@Roles(
  SystemRole.DEPARTMENT_HEAD,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
  SystemRole.SYSTEM_ADMIN,
)
@Patch('attendance-corrections/:requestId/review')
async reviewCorrectionRequest(
  @Param('requestId') requestId: string,
  @Body() dto: { status: CorrectionRequestStatus.APPROVED | CorrectionRequestStatus.REJECTED; reviewerId: string },
) {

  // Allowed statuses for this endpoint
  const allowed = [
    CorrectionRequestStatus.APPROVED,
    CorrectionRequestStatus.REJECTED,
  ];

  // Validate status BEFORE calling service
  if (!allowed.includes(dto.status)) {
    throw new BadRequestException(
      'Invalid status. Only APPROVED or REJECTED are allowed.',
    );
  }

  return this.timeManagementService.reviewCorrectionRequest(
    new Types.ObjectId(requestId),
    dto.status,
    new Types.ObjectId(dto.reviewerId),
  );
}
// ================================================
// USER STORY 14 — TIME EXCEPTION APPROVAL WORKFLOW
// ================================================

// 1) Manager/HR get pending time exceptions assigned to them
@UseGuards(RolesGuard)
@Roles(
  SystemRole.DEPARTMENT_HEAD,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
  SystemRole.SYSTEM_ADMIN,
)
@Get('time-exceptions/pending/:reviewerId')
getPendingTimeExceptionsForReview(@Param('reviewerId') reviewerId: string) {
  return this.timeManagementService.getPendingTimeExceptionsForReview(
    new Types.ObjectId(reviewerId),
  );
}

// 2) Review time exception (approve / reject)
@UseGuards(RolesGuard)
@Roles(
  SystemRole.DEPARTMENT_HEAD,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
  SystemRole.SYSTEM_ADMIN,
)
@Patch('time-exceptions/:exceptionId/review')
async reviewTimeException(
  @Param('exceptionId') exceptionId: string,
  @Body() dto: { reviewerId: string; status: TimeExceptionStatus.APPROVED | TimeExceptionStatus.REJECTED; comment?: string },
) {
  const allowed = [
    TimeExceptionStatus.APPROVED,
    TimeExceptionStatus.REJECTED,
  ];

  if (!allowed.includes(dto.status)) {
    throw new BadRequestException(
      'Invalid status. Only APPROVED or REJECTED are allowed.',
    );
  }

  return this.timeManagementService.reviewTimeException(
    new Types.ObjectId(exceptionId),
    new Types.ObjectId(dto.reviewerId),
    dto.status,
    dto.comment,
  );
}

// 3) Get pending correction requests (for HR workflow)
@UseGuards(RolesGuard)
@Roles(
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
  SystemRole.SYSTEM_ADMIN,
)
@Get('correction-requests/pending')
getPendingCorrectionRequests() {
  return this.timeManagementService.getPendingCorrectionRequests();
}

// 4) Review correction request (approve / reject)
@UseGuards(RolesGuard)
@Roles(
  SystemRole.DEPARTMENT_HEAD,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
  SystemRole.SYSTEM_ADMIN,
)
@Patch('correction-requests/:requestId/review')
async reviewCorrectionRequestWorkflow(
  @Param('requestId') requestId: string,
  @Body() dto: { reviewerId: string; status: CorrectionRequestStatus.APPROVED | CorrectionRequestStatus.REJECTED },
) {
  const allowed = [
    CorrectionRequestStatus.APPROVED,
    CorrectionRequestStatus.REJECTED,
  ];

  if (!allowed.includes(dto.status)) {
    throw new BadRequestException(
      'Invalid status. Only APPROVED or REJECTED are allowed.',
    );
  }

  return this.timeManagementService.reviewCorrectionRequestWorkflow(
    new Types.ObjectId(requestId),
    new Types.ObjectId(dto.reviewerId),
    dto.status,
  );
}

// 5) Auto-escalate stale time exceptions (manual trigger; Cron runs inside service)
@UseGuards(RolesGuard)
@Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_ADMIN)
@Post('time-exceptions/escalate')
autoEscalateUnresolvedExceptions() {
  return this.timeManagementService.autoEscalateUnresolvedExceptions();
}

// 6) Auto-escalate stale correction requests before payroll cutoff
@UseGuards(RolesGuard)
@Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_ADMIN)
@Post('correction-requests/escalate-payroll')
autoEscalateStaleCorrectionRequestsForPayroll() {
  return this.timeManagementService.autoEscalateStaleCorrectionRequestsForPayroll();
}

// ================================================
// USER STORY 15 — PERMISSION VALIDATION RULES
// ================================================

// 1) Employee submits a permission request
@UseGuards(RolesGuard)
@Roles(
  SystemRole.DEPARTMENT_EMPLOYEE,
  SystemRole.HR_EMPLOYEE,
  SystemRole.HR_MANAGER,
  SystemRole.SYSTEM_ADMIN,
)
@Post('permissions')
submitPermissionRequest(@Body() dto: any) {
  return this.timeManagementService.submitPermissionRequest({
    employeeId: new Types.ObjectId(dto.employeeId),
    attendanceRecordId: new Types.ObjectId(dto.attendanceRecordId),
    type: dto.type,
    minutesRequested: dto.minutesRequested,
    reason: dto.reason,
  });
}

// 2) Manager / HR approves or rejects a permission request
@UseGuards(RolesGuard)
@Roles(
  SystemRole.DEPARTMENT_HEAD,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
  SystemRole.SYSTEM_ADMIN,
)
@Patch('permissions/:exceptionId/review')
async reviewPermissionRequest(
  @Param('exceptionId') exceptionId: string,
  @Body() dto: { reviewerId: string; status: TimeExceptionStatus.APPROVED | TimeExceptionStatus.REJECTED; comment?: string },
) {
  // Allowed statuses
  const allowed = [
    TimeExceptionStatus.APPROVED,
    TimeExceptionStatus.REJECTED,
  ];

  if (!allowed.includes(dto.status)) {
    throw new BadRequestException(
      'Invalid status. Only APPROVED or REJECTED are allowed.',
    );
  }

  return this.timeManagementService.reviewPermissionRequest(
    new Types.ObjectId(exceptionId),
    new Types.ObjectId(dto.reviewerId),
    dto.status,
    dto.comment,
  );
}

// 3) Payroll fetches approved permissions for the month
@UseGuards(RolesGuard)
@Roles(
  SystemRole.PAYROLL_SPECIALIST,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
  SystemRole.SYSTEM_ADMIN,
)
@Get('permissions/approved/:employeeId')
getApprovedPermissionsForPayroll(
  @Param('employeeId') employeeId: string,
  @Query('start') start: string,
  @Query('end') end: string,
) {
  return this.timeManagementService.getApprovedPermissionsForPayroll(
    new Types.ObjectId(employeeId),
    { start: new Date(start), end: new Date(end) },
  );
}

// 4) Auto-escalate stale permission requests (manual trigger)
// Cron runs inside service; this route is optional
@UseGuards(RolesGuard)
@Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_ADMIN)
@Post('permissions/escalate')
autoEscalatePendingPermissions() {
  return this.timeManagementService.autoEscalatePendingPermissions();
}
// ================================================
// USER STORY 16 — VACATION PACKAGE INTEGRATION
// ================================================

// Run vacation → attendance sync for ONE employee
@UseGuards(RolesGuard)
@Roles(
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
  SystemRole.SYSTEM_ADMIN,
)
@Post('vacation/integrate/:employeeId')
integrateVacationPackages(
  @Param('employeeId') employeeId: string,
  @Body() dto: { start: string; end: string },
) {
  return this.timeManagementService.integrateVacationPackages(
    new Types.ObjectId(employeeId),
    {
      start: new Date(dto.start),
      end: new Date(dto.end),
    },
  );
}

// OPTIONAL: Run integration for ALL employees (if needed later)
// This depends on whether you want batch sync; comment out if not needed.
/*
@UseGuards(RolesGuard)
@Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_ADMIN)
@Post('vacation/integrate-all')
integrateVacationForAll(@Body() dto: { start: string; end: string }) {
  return this.timeManagementService.integrateVacationForAll({
    start: new Date(dto.start),
    end: new Date(dto.end),
  });
}
*/
// ================================================
// USER STORY 17 — HOLIDAY & REST DAY CONFIGURATION
// ================================================

// 1) Create a holiday (Admin only)
@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_ADMIN,
)
@Post('holidays')
createHoliday(@Body() dto: any) {
  return this.timeManagementService.createHoliday({
    type: dto.type,
    startDate: new Date(dto.startDate),
    endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    name: dto.name,
  });
}

// 2) Apply holiday rules for employee within range
@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
)
@Post('holidays/apply/:employeeId')
applyHolidayRange(
  @Param('employeeId') employeeId: string,
  @Body() dto: { start: string; end: string },
) {
  return this.timeManagementService.applyHolidayRange(
    new Types.ObjectId(employeeId),
    {
      start: new Date(dto.start),
      end: new Date(dto.end),
    },
  );
}



// ================================================
// USER STORY 18 — ESCALATION BEFORE PAYROLL CUT-OFF
// ================================================

// Trigger escalation job before payroll cut-off
@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_ADMIN,
)
@Post('escalations/payroll')
escalatePendingRequestsBeforePayroll(@Body() dto: { cutoff: string }) {
  return this.timeManagementService.escalatePendingRequestsBeforePayroll(
    new Date(dto.cutoff),
  );
}

// ================================================
// USER STORY 19 — OVERTIME & EXCEPTION REPORTS
// ================================================

// 1) Generate overtime report (JSON or CSV)
@UseGuards(RolesGuard)
@Roles(
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
  SystemRole.PAYROLL_SPECIALIST,
  SystemRole.SYSTEM_ADMIN,
)
@Get('reports/overtime')
async generateOvertimeReport(
  @Query('start') start: string,
  @Query('end') end: string,
  @Query('exportCsv') exportCsv?: string,
) {
  return this.timeManagementService.generateOvertimeReport(
    { start: new Date(start), end: new Date(end) },
    exportCsv === 'true',
  );
}

// 2) Generate exception report (JSON or CSV)
@UseGuards(RolesGuard)
@Roles(
  SystemRole.HR_MANAGER,
  SystemRole.HR_ADMIN,
  SystemRole.PAYROLL_SPECIALIST,
  SystemRole.SYSTEM_ADMIN,
)
@Get('reports/exceptions')
async generateExceptionReport(
  @Query('start') start: string,
  @Query('end') end: string,
  @Query('exportCsv') exportCsv?: string,
) {
  return this.timeManagementService.generateExceptionReport(
    { start: new Date(start), end: new Date(end) },
    exportCsv === 'true',
  );
}
// ================================================
// USER STORY 20 — CROSS-MODULE DATA SYNCHRONIZATION
// ================================================

// Manual trigger for cross-module sync (Payroll + Leaves)
@UseGuards(RolesGuard)
@Roles(
  SystemRole.SYSTEM_ADMIN,
  SystemRole.HR_ADMIN,
  SystemRole.HR_MANAGER,
)
@Post('sync/cross-modules')
syncCrossModuleData(@Body() dto: { start: string; end: string }) {
  return this.timeManagementService.syncCrossModuleData({
    start: new Date(dto.start),
    end: new Date(dto.end),
  });
}

}
