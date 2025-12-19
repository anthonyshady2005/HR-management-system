// NestJS Core
import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
// Mongoose
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Parser as Json2CsvParser } from 'json2csv';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
// Schemas (Models)
import { AttendanceRecord, AttendanceRecordDocument, Punch } from './models/attendance-record.schema';
import { AttendanceCorrectionRequest, AttendanceCorrectionRequestDocument } from './models/attendance-correction-request.schema';
import { Shift, ShiftDocument } from './models/shift.schema';
import { ShiftAssignment, ShiftAssignmentDocument } from './models/shift-assignment.schema';
import { ShiftType, ShiftTypeDocument } from './models/shift-type.schema';
import { ScheduleRule, ScheduleRuleDocument } from './models/schedule-rule.schema';
import { LatenessRule, LatenessRuleDocument } from './models/lateness-rule.schema';
import { OvertimeRule, OvertimeRuleDocument } from './models/overtime-rule.schema';
import { TimeException, TimeExceptionDocument } from './models/time-exception.schema';
import { Holiday, HolidayDocument } from './models/holiday.schema';
import { NotificationLog, NotificationLogDocument } from './models/notification-log.schema';
import { EmployeeProfile, EmployeeProfileDocument } from 'src/employee-profile/models/employee-profile.schema';
import { Department, DepartmentDocument } from 'src/organization-structure/models/department.schema';
import { Position, PositionDocument } from 'src/organization-structure/models/position.schema';
import { LeaveRequest,LeaveRequestDocument} from 'src/leaves/models/leave-request.schema';
import { LeavesService } from 'src/leaves/leaves.service';
import {PayrollTrackingService} from 'src/payroll-tracking/payroll-tracking.service';
import { EmployeeSystemRole, EmployeeSystemRoleDocument } from 'src/employee-profile/models/employee-system-role.schema';
import { PositionAssignment } from '../organization-structure/models/position-assignment.schema';
import {ShiftExpiryNotification,ShiftExpiryNotificationDocument} from './models/shift-expiry-notification.schema';
import { Calendar,CalendarDocument } from 'src/leaves/models/calendar.schema';
// Enums
import {
  PunchType,
  PunchPolicy,
  CorrectionRequestStatus,
  TimeExceptionStatus,
  TimeExceptionType,
  HolidayType,
  ShiftAssignmentStatus
} from './models/enums';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';


// DTOs (Create + Update)
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
import {CreateShiftExpiryNotificationDto} from './dto/shift-expiry-notification-create.dto';

// Utilities
import { differenceInMinutes, isBefore, isAfter, parseISO } from 'date-fns';


@Injectable()
export class TimeManagementService {
  private readonly timeManagementNotificationTypes: string[] = [
    'MISSED_PUNCH',
    'MISSED_PUNCH_SUPERVISOR',
    'EMPLOYEE_LATE',
    'EMPLOYEE_REPEATED_LATENESS',
    'HOLIDAY_APPLIED',
    'PERMISSION_SUBMITTED',
    'PERMISSION_DECISION',
    'PERMISSION_ESCALATED',
    'TIME_EXCEPTION_DECISION',
    'TIME_EXCEPTION_ESCALATED',
    'CORRECTION_REQUEST_SUBMITTED',
    'CORRECTION_REQUEST_DECISION',
    'CORRECTION_REQUEST_ESCALATED',
    'REQUEST_ESCALATED',
    'EXCEPTION_ESCALATED',
  ];
  constructor(
    @InjectModel(ShiftAssignment.name)
    private readonly shiftAssignmentModel: Model<ShiftAssignmentDocument>,

    @InjectModel(Shift.name)
    private readonly shiftModel: Model<ShiftDocument>,

    @InjectModel(ShiftType.name)
    private readonly shiftTypeModel: Model<ShiftTypeDocument>,

    @InjectModel(ScheduleRule.name)
    private readonly scheduleRuleModel: Model<ScheduleRuleDocument>,

    // Will be replaced with correct models once provided
    @InjectModel(EmployeeProfile.name)
    private readonly employeeModel: Model<any>,

    @InjectModel(Department.name)
    private readonly departmentModel: Model<any>,

    @InjectModel(Position.name)
    private readonly positionModel: Model<any>,

    @InjectModel(NotificationLog.name)
    private readonly notificationLogModel: Model<NotificationLogDocument>,

    @InjectModel(AttendanceRecord.name)
    private readonly attendanceRecordModel: Model<AttendanceRecordDocument>,

    @InjectModel(AttendanceCorrectionRequest.name)
    private readonly correctionRequestModel: Model<AttendanceCorrectionRequestDocument>,

    @InjectModel(TimeException.name)
    private readonly timeExceptionModel: Model<TimeExceptionDocument>,

    @InjectModel(OvertimeRule.name)
    private readonly overtimeRuleModel: Model<OvertimeRuleDocument>,

    @InjectModel(LatenessRule.name)
    private readonly latenessRuleModel: Model<LatenessRuleDocument>,

    @InjectModel(AttendanceCorrectionRequest.name)
    private readonly attendanceCorrectionRequestModel: Model<AttendanceCorrectionRequestDocument>,

    @InjectModel(LeaveRequest.name)
    private readonly leaveRequestService: Model<LeaveRequestDocument>,

    @InjectModel(Holiday.name)
    private readonly holidayModel: Model<HolidayDocument>,

    @Inject(LeavesService)
    private readonly leavesService: LeavesService,

    @Inject(PayrollTrackingService)
    private readonly payrollTrackingService: PayrollTrackingService,

    @InjectModel(EmployeeSystemRole.name)
    private readonly employeeSystemRoleModel: Model<EmployeeSystemRoleDocument>,

       @InjectModel(PositionAssignment.name)
    private readonly positionAssignmentModel: Model<PositionAssignment>,

    @InjectModel(Calendar.name)
    private readonly calendarModel: Model<CalendarDocument>,

   @InjectModel(ShiftExpiryNotification.name)
    private readonly shiftExpiryNotificationModel: Model<ShiftExpiryNotificationDocument>,

    







  ) {}
  
  // ================================================
  // USER STORY 1 — SHIFT ASSIGNMENT MANAGEMENT
  // ================================================

  async assignShiftToEmployee(dto: ShiftAssignmentCreateDTO) {
    await this.validateShiftAssignmentInput(dto);

    const assignment = new this.shiftAssignmentModel({
      ...dto,
      status: this.determineStatus(dto.startDate, dto.endDate),
    });

    return assignment.save();
  }

async assignShiftToDepartment(departmentId: Types.ObjectId, dto: ShiftAssignmentCreateDTO) {
  // 1. Verify department exists
  const department = await this.departmentModel.findById(departmentId);
  if (!department) {
    throw new NotFoundException(
      `Department not found. Please verify the department ID.`
    );
  }

  console.log('✅ Department found:', department.name);

  // 2. Validate shift exists BEFORE querying employees
  await this.ensureShiftExists(dto.shiftId);

  // 3. Find employees using primaryDepartmentId
  const employees = await this.employeeModel.find({
    primaryDepartmentId: departmentId,
    status: 'ACTIVE'  // Only active employees
  }).lean();

  console.log('📊 Found employees in department:', employees.length);

  // 4. Handle no employees gracefully
  if (!employees.length) {
    throw new BadRequestException({
      statusCode: 400,
      message: `No active employees found in department "${department.name}".`,
      error: 'NO_EMPLOYEES_IN_DEPARTMENT',
      departmentId: departmentId.toString(),
      departmentName: department.name,
      suggestion: 'Please assign employees to this department before creating shift assignments.',
    });
  }

  // 5. Create assignments
  const assignments = employees.map((emp) => ({
    ...dto,
    employeeId: emp._id,
    status: this.determineStatus(dto.startDate, dto.endDate),
  }));

  console.log('📝 Creating assignments for', assignments.length, 'employees');

  try {
    const result = await this.shiftAssignmentModel.insertMany(assignments);
    
    return {
      success: true,
      message: `Successfully assigned shift to ${result.length} employees in department "${department.name}".`,
      assignmentCount: result.length,
      departmentName: department.name,
      assignments: result,
    };
  } catch (error) {
    console.error('❌ Error creating assignments:', error);
    throw new BadRequestException(
      `Failed to create shift assignments: ${error.message}`
    );
  }
}

  async assignShiftToPosition(
  positionId: Types.ObjectId,
  dto: ShiftAssignmentCreateDTO,
) {
  // 1️⃣ Ensure position exists
  await this.ensurePositionExists(positionId);

  // 2️⃣ Get ACTIVE position assignments
  const positionAssignments = await this.positionAssignmentModel.find({
    positionId,
    endDate: null, // active only
  });

  if (!positionAssignments.length) {
    throw new NotFoundException(
      'No employees found in this position.',
    );
  }

  // 3️⃣ Create shift assignments
  const assignments = positionAssignments.map((pa) => ({
    shiftId: dto.shiftId,
    employeeId: pa.employeeProfileId, // ✅ CORRECT SOURCE
    startDate: dto.startDate,
    endDate: dto.endDate,
    status: this.determineStatus(dto.startDate, dto.endDate),
  }));

  return this.shiftAssignmentModel.insertMany(assignments);
}





async updateShiftAssignment(id: string, dto: ShiftAssignmentUpdateDTO) {
  const assignment = await this.shiftAssignmentModel.findById(id);
  if (!assignment) {
    throw new NotFoundException("Shift assignment not found.");
  }

  // ========= RELATIONS =========

  if (dto.employeeId) {
    assignment.employeeId = new Types.ObjectId(String(dto.employeeId));
  }

  if (dto.departmentId) {
    assignment.departmentId = new Types.ObjectId(String(dto.departmentId));
  }

  if (dto.positionId) {
    assignment.positionId = new Types.ObjectId(String(dto.positionId));
  }

  if (dto.shiftId) {
    assignment.shiftId = new Types.ObjectId(String(dto.shiftId));
  }

  // ✅ NEW: schedule rule – allow set / clear
  if (dto.scheduleRuleId !== undefined) {
    assignment.scheduleRuleId = dto.scheduleRuleId
      ? new Types.ObjectId(String(dto.scheduleRuleId))
      : undefined;
  }

  // ========= DATES =========

  if (dto.startDate) {
    assignment.startDate = new Date(dto.startDate as any);
  }

  if (dto.endDate !== undefined) {
    assignment.endDate = dto.endDate ? new Date(dto.endDate as any) : undefined;
  }

  // ========= STATUS RECALC =========

  assignment.status = this.determineStatus(
    assignment.startDate,
    assignment.endDate,
    assignment.status, // previous status
  );

  const saved = await assignment.save();

  // (Optional) repopulate if you want fresh relations in response:
  return saved.populate([
    "employeeId",
    "departmentId",
    "positionId",
    {
      path: "shiftId",
      populate: { path: "shiftType" },
    },
    "scheduleRuleId",
  ]);
}




  async expireShiftAssignmentsAutomatically() {
    const now = new Date();

    await this.shiftAssignmentModel.updateMany(
      {
        endDate: { $lt: now },
        status: { $ne: ShiftAssignmentStatus.EXPIRED },
      },
      { status: ShiftAssignmentStatus.EXPIRED }
    );
  }
async getShiftAssignments(filters: {
  employeeId?: Types.ObjectId;
  departmentId?: Types.ObjectId;
  positionId?: Types.ObjectId;
  status?: string;
  start?: Date;
  end?: Date;
}) {
  const query: any = {};

  if (filters.employeeId) query.employeeId = filters.employeeId;
  if (filters.status) query.status = filters.status;

  if (filters.start || filters.end) {
    query.startDate = {};
    if (filters.start) query.startDate.$gte = filters.start;
    if (filters.end) query.startDate.$lte = filters.end;
  }

  const assignments = await this.shiftAssignmentModel
    .find(query)
    .populate({
      path: 'employeeId',
      select: 'firstName lastName personalEmail primaryDepartmentId primaryPositionId',
      populate: [
        { path: 'primaryDepartmentId', select: 'name' },
        { path: 'primaryPositionId', select: 'name' },
      ],
    })
    .populate({
      path: 'shiftId',
      populate: { path: 'shiftType', select: 'name' },
    })
    .populate('scheduleRuleId')
    .sort({ startDate: -1 });

  const now = new Date();

  for (const a of assignments) {
    const computedStatus = this.determineStatus(
      a.startDate,
      a.endDate,
      a.status,  // ✅ ADD THIS - Pass current status!
    );

    if (a.status !== computedStatus) {
      a.status = computedStatus;
      await a.save();
    }
  }

  return assignments;
}

async getShiftAssignmentById(id: string) {
  const assignment = await this.shiftAssignmentModel
    .findById(id)
    .populate('employeeId', 'firstName lastName')
    .populate('shiftId')
    .populate('scheduleRuleId');

  if (!assignment) {
    throw new NotFoundException('Shift assignment not found.');
  }

  return assignment;
}
async updateShiftAssignmentStatus(
  id: string,
  status: ShiftAssignmentStatus,
) {
  const assignment = await this.shiftAssignmentModel.findById(id);
  if (!assignment) {
    throw new NotFoundException('Shift assignment not found.');
  }

  // 🔒 Manual cancellation always allowed
  if (status === ShiftAssignmentStatus.CANCELLED) {
    assignment.status = ShiftAssignmentStatus.CANCELLED;
    return assignment.save();
  }

  // ❌ Cannot revive expired assignments via status only
  if (assignment.status === ShiftAssignmentStatus.EXPIRED) {
    throw new BadRequestException(
      'Expired assignments cannot change status.',
    );
  }

  // 🔄 For other cases, recalculate safely using start and end dates only
  assignment.status = this.determineStatus(
    assignment.startDate,
    assignment.endDate,
  );

  return assignment.save();
}

// ======================================================
// LOOKUP METHODS — REQUIRED BY SHIFT ASSIGNMENT UI
// SAFE, READ-ONLY, NO SIDE EFFECTS
// ======================================================

async getAllEmployees() {
  const employees = await this.employeeModel
    .find(
      {},
      {
        firstName: 1,
        lastName: 1,
        personalEmail: 1,
      },
    )
    .lean();

  return employees.map((emp) => ({
    _id: emp._id,
    personalemail: emp.personalEmail ?? '',
    name: `${emp.firstName ?? ''} ${emp.lastName ?? ''}`.trim(),
  }));
}

async getAllDepartments() {
  const departments = await this.departmentModel
    .find({}, { name: 1 })
    .lean();

  return departments.map((dep) => ({
    _id: dep._id,
    name: dep.name,
  }));
}

async getAllPositions() {
  const positions = await this.positionModel
    .find(
      { isActive: true },        // optional but recommended
      { title: 1 }               // ✅ correct field
    )
    .lean();

  return positions.map((pos) => ({
    _id: pos._id,
    name: pos.title,             // ✅ normalize for frontend
  }));
}

async revokeShiftAssignment(id: string) {
  console.log('🔴 REVOKE METHOD CALLED');
  console.log('🔴 ID received:', id);
  
  const assignment = await this.shiftAssignmentModel.findById(id);
  
  console.log('🟡 Assignment found:', assignment ? 'YES' : 'NO');
  
  if (!assignment) {
    console.log('❌ Assignment not found - throwing error');
    throw new NotFoundException('Shift assignment not found.');
  }

  console.log('🟢 BEFORE status:', assignment.status);
  console.log('🟢 Setting status to:', ShiftAssignmentStatus.CANCELLED);
  
  assignment.status = ShiftAssignmentStatus.CANCELLED;
  
  console.log('🟡 Status after assignment:', assignment.status);
  
  const saved = await assignment.save();
  
  console.log('✅ SAVED status:', saved.status);
  console.log('✅ Full saved object:', JSON.stringify(saved, null, 2));
  
  return saved;
}

// Make deleteShiftAssignment call revokeShiftAssignment
async deleteShiftAssignment(id: string) {
  return this.revokeShiftAssignment(id);
}

  // ================================================
  // INTERNAL VALIDATION HELPERS
  // ================================================

  private async validateShiftAssignmentInput(dto: ShiftAssignmentCreateDTO) {
    await this.ensureShiftExists(dto.shiftId);

    if (dto.scheduleRuleId) {
      await this.ensureScheduleRuleExists(dto.scheduleRuleId);
    }

    if (dto.employeeId) {
      await this.ensureEmployeeExists(dto.employeeId);
    }

    if (dto.endDate && dto.startDate > dto.endDate) {
      throw new BadRequestException('startDate cannot be after endDate.');
    }
  }

  private async ensureShiftExists(id: Types.ObjectId) {
    const shift = await this.shiftModel.findById(id);
    if (!shift) throw new NotFoundException('Shift not found.');
  }

  private async ensureScheduleRuleExists(id: Types.ObjectId) {
    const rule = await this.scheduleRuleModel.findById(id);
    if (!rule) throw new NotFoundException('Schedule rule not found.');
  }

  private async ensureEmployeeExists(id: Types.ObjectId) {
    const emp = await this.employeeModel.findById(id);
    if (!emp) throw new NotFoundException('Employee not found.');
  }

  private async ensureDepartmentExists(id: Types.ObjectId) {
    const dept = await this.departmentModel.findById(id);
    if (!dept) throw new NotFoundException('Department not found.');
  }

  private async ensurePositionExists(id: Types.ObjectId) {
    const pos = await this.positionModel.findById(id);
    if (!pos) throw new NotFoundException('Position not found.');
  }

  // ================================================
  // SHIFT STATUS LOGIC
  // ================================================

  private determineStatus(
  start: Date,
  end?: Date,
  currentStatus?: ShiftAssignmentStatus,
): ShiftAssignmentStatus {
  const now = new Date();

  // 🔒 Manual override always wins
  if (currentStatus === ShiftAssignmentStatus.CANCELLED) {
    return ShiftAssignmentStatus.CANCELLED;
  }

  if (end && end < now) {
    return ShiftAssignmentStatus.EXPIRED;
  }

  if (start > now) {
    return ShiftAssignmentStatus.PENDING;
  }

  return ShiftAssignmentStatus.APPROVED;
}




// ================================================
// USER STORY 2 — SHIFT CONFIGURATION & TYPES
// BR-TM-03, BR-TM-04
// ================================================

// ------------------------------------------------
// SHIFT TYPES (Normal, Split, Overnight, Rotational…)
// ------------------------------------------------

async createShiftType(dto: { name: string; active?: boolean }) {
  const exists = await this.shiftTypeModel.findOne({ name: dto.name });
  if (exists) throw new BadRequestException('Shift type already exists.');

  const type = new this.shiftTypeModel({
    name: dto.name,
    active: dto.active ?? true,
  });

  return type.save();
}

async getAllShiftTypes() {
  return this.shiftTypeModel.find().sort({ name: 1 });
}

async getShiftTypeById(id: string) {
  const type = await this.shiftTypeModel.findById(id);
  if (!type) throw new NotFoundException('Shift type not found.');
  return type;
}

async updateShiftType(id: string, dto: { name?: string; active?: boolean }) {
  const type = await this.shiftTypeModel.findById(id);
  if (!type) throw new NotFoundException('Shift type not found.');

  if (dto.name) {
    const conflict = await this.shiftTypeModel.findOne({
      name: dto.name,
      _id: { $ne: id }
    });
    if (conflict) throw new BadRequestException('Shift type name already in use.');
  }

  Object.assign(type, dto);
  return type.save();
}

async deactivateShiftType(id: string) {
  const type = await this.shiftTypeModel.findById(id);
  if (!type) throw new NotFoundException('Shift type not found.');

  type.active = false;
  return type.save();
}

// ------------------------------------------------
// SHIFT NAMES / ACTUAL SHIFT DEFINITIONS
// (Fixed Core Hours, Flex-Time, Rotational…)
// ------------------------------------------------

async createShift(dto: {
  name: string;
  shiftType: Types.ObjectId;
  startTime: string;
  endTime: string;
  punchPolicy?: any;
  graceInMinutes?: number;
  graceOutMinutes?: number;
  requiresApprovalForOvertime?: boolean;
  active?: boolean;
}) {
  await this.ensureShiftTypeExists(dto.shiftType);
  this.ensureShiftTimesValid(dto.startTime, dto.endTime);

  const existing = await this.shiftModel.findOne({ name: dto.name });
  if (existing) {
    throw new BadRequestException('Shift name already exists.');
  }

  // Warning for overnight shifts with incompatible punch policy
  const isOvernight = this.isOvernightShift(dto.startTime, dto.endTime);
  if (isOvernight && dto.punchPolicy === 'ONLY_FIRST') {
    console.warn(
      `⚠️ Overnight shift "${dto.name}" uses ONLY_FIRST policy - this may cause attendance tracking issues`
    );
  }

  const shift = new this.shiftModel({
    ...dto,
    punchPolicy: dto.punchPolicy ?? 'FIRST_LAST',
    graceInMinutes: dto.graceInMinutes ?? 0,
    graceOutMinutes: dto.graceOutMinutes ?? 0,
    requiresApprovalForOvertime: dto.requiresApprovalForOvertime ?? false,
    active: dto.active ?? true,
  });

  return shift.save();
}

async getAllShifts() {
  const shifts = await this.shiftModel.find().populate('shiftType').sort({ name: 1 });
  
  // Add computed fields to response
  return shifts.map(shift => {
    const shiftObj = shift.toObject();
    return {
      ...shiftObj,
      isOvernight: this.isOvernightShift(shiftObj.startTime, shiftObj.endTime),
      durationHours: this.calculateShiftHours(shiftObj.startTime, shiftObj.endTime),
    };
  });
}

async getShiftById(id: string) {
  const shift = await this.shiftModel.findById(id).populate('shiftType');
  if (!shift) throw new NotFoundException('Shift not found.');
  
  const shiftObj = shift.toObject();
  return {
    ...shiftObj,
    isOvernight: this.isOvernightShift(shiftObj.startTime, shiftObj.endTime),
    durationHours: this.calculateShiftHours(shiftObj.startTime, shiftObj.endTime),
  };
}

async updateShift(id: string, dto: any) {
  const shift = await this.shiftModel.findById(id);
  if (!shift) throw new NotFoundException('Shift not found.');

  if (dto.shiftType) {
    await this.ensureShiftTypeExists(dto.shiftType);
  }

  if (dto.startTime || dto.endTime) {
    const newStart = dto.startTime ?? shift.startTime;
    const newEnd = dto.endTime ?? shift.endTime;
    
    this.ensureShiftTimesValid(newStart, newEnd);
    
    // Warning for overnight shifts with incompatible punch policy
    const isOvernight = this.isOvernightShift(newStart, newEnd);
    const punchPolicy = dto.punchPolicy ?? shift.punchPolicy;
    if (isOvernight && punchPolicy === 'ONLY_FIRST') {
      console.warn(
        `⚠️ Overnight shift "${shift.name}" uses ONLY_FIRST policy - this may cause attendance tracking issues`
      );
    }
  }

  Object.assign(shift, dto);
  return shift.save();
}

async deactivateShift(id: string) {
  const shift = await this.shiftModel.findById(id);
  if (!shift) throw new NotFoundException('Shift not found.');

  shift.active = false;
  return shift.save();
}

// ================================================
// INTERNAL HELPERS (User Story 2)
// ================================================

private async ensureShiftTypeExists(id: Types.ObjectId) {
  const type = await this.shiftTypeModel.findById(id);
  if (!type) throw new NotFoundException('Shift type not found.');
}

private ensureShiftTimesValid(start: string, end: string) {
  // Format expected HH:MM
  const isValid = /^[0-2]\d:[0-5]\d$/.test(start) && /^[0-2]\d:[0-5]\d$/.test(end);
  if (!isValid) {
    throw new BadRequestException('Start/End time must be in HH:MM format.');
  }

  // Overnight shifts allowed
  if (start === end) {
    throw new BadRequestException('Shift start and end time cannot be identical.');
  }
}

/**
 * Determine if a shift crosses midnight (overnight shift)
 * Example: 22:00 to 06:00 returns true
 */
private isOvernightShift(startTime: string, endTime: string): boolean {
  const [startHour] = startTime.split(':').map(Number);
  const [endHour] = endTime.split(':').map(Number);
  
  return endHour < startHour;
}

/**
 * Calculate total shift duration in hours
 * Handles overnight shifts correctly
 * Example: 22:00 to 06:00 = 8 hours
 */
private calculateShiftHours(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
  
  // Handle overnight shifts (negative means it crosses midnight)
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60;
  }
  
  // Return hours with 2 decimal precision
  return Math.round((totalMinutes / 60) * 100) / 100;
}
// ================================================
// USER STORY 3 — CUSTOM SCHEDULING RULES
// BR-TM-04, BR-TM-10
// ================================================

async createScheduleRule(dto: { name: string; pattern: string; active?: boolean }) {
  // Prevent duplicate rule names
  const exists = await this.scheduleRuleModel.findOne({ name: dto.name });
  if (exists) {
    throw new BadRequestException('A scheduling rule with this name already exists.');
  }

  // Validate rule pattern format
  this.validateSchedulingPattern(dto.pattern);

  const rule = new this.scheduleRuleModel({
    name: dto.name,
    pattern: dto.pattern,
    active: dto.active ?? true,
  });

  return rule.save();
}

async getAllScheduleRules() {
  return this.scheduleRuleModel.find().sort({ name: 1 });
}

// ✅ ADD THIS
async getScheduleRuleById(id: string) {
  const rule = await this.scheduleRuleModel.findById(id);
  if (!rule) throw new NotFoundException('Schedule rule not found.');
  return rule;
}

async updateScheduleRule(id: string, dto: { name?: string; pattern?: string; active?: boolean }) {
  const rule = await this.scheduleRuleModel.findById(id);
  if (!rule) throw new NotFoundException('Schedule rule not found.');

  if (dto.name) {
    const conflict = await this.scheduleRuleModel.findOne({
      name: dto.name,
      _id: { $ne: id }
    });
    if (conflict) {
      throw new BadRequestException('A scheduling rule with this name already exists.');
    }
  }

  if (dto.pattern) {
    this.validateSchedulingPattern(dto.pattern);
  }

  Object.assign(rule, dto);
  return rule.save();
}

async deactivateScheduleRule(id: string) {
  const rule = await this.scheduleRuleModel.findById(id);
  if (!rule) throw new NotFoundException('Schedule rule not found.');

  rule.active = false;
  return rule.save();
}

// ================================================
// INTERNAL HELPERS (Scheduling Rule Validation)
// ================================================

/**
 * Valid formats allowed for "pattern":
 * - "4on-3off"          → Rotation pattern (4 days on, 3 days off)
 * - "Mon,Tue,Thu"       → Weekly specific days
 * - "Flex(08:00-10:00,16:00-18:00)" → Flexible start/end windows
 * - "Compressed(10h x 4d)" → Compressed workweek
 */
private validateSchedulingPattern(pattern: string) {
  if (!pattern || typeof pattern !== 'string') {
    throw new BadRequestException('Invalid schedule pattern format.');
  }

  const flexiblePattern = /^Flex\(\d{2}:\d{2}-\d{2}:\d{2},\d{2}:\d{2}-\d{2}:\d{2}\)$/;
  const weeklyListPattern = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(,(Mon|Tue|Wed|Thu|Fri|Sat|Sun))*$/;
  const compressedPattern = /^Compressed\(\d{1,2}h x \d{1,2}d\)$/;
  const rotationPattern = /^\d+on-\d+off$/;

  const valid =
    flexiblePattern.test(pattern) ||
    weeklyListPattern.test(pattern) ||
    compressedPattern.test(pattern) ||
    rotationPattern.test(pattern);

  if (!valid) {
    throw new BadRequestException(
      'Invalid scheduling pattern. Supported examples: "4on-3off", "Mon,Wed,Fri", "Flex(08:00-10:00,16:00-18:00)", "Compressed(10h x 4d)".'
    );
  }
}
// ================================================
// USER STORY 4 — SHIFT EXPIRY NOTIFICATIONS (NEW MODEL)
// BR-TM-05
// ================================================

async notifyUpcomingShiftExpiry(daysBefore: number = 3) {
  const now = new Date();

  const targetDate = new Date();
  targetDate.setDate(now.getDate() + daysBefore);
 await this.shiftExpiryNotificationModel.deleteMany({});
  /**
   * 1️⃣ Find assignments that are expiring soon
   */
  const expiringAssignments = await this.shiftAssignmentModel
    .find({
      endDate: { $lte: targetDate, $gte: now },
      status: { $ne: 'EXPIRED' },
    })
    .lean();

  if (!expiringAssignments.length) {
    return { message: 'No upcoming shift expirations.' };
  }

  /**
   * 2️⃣ Check existing notifications
   * Rule: ONE notification per assignment ever
   */
  const assignmentIds = expiringAssignments.map(a => a._id.toString());

  const existingNotifications =
    await this.shiftExpiryNotificationModel
      .find({ assignmentId: { $in: assignmentIds } })
      .lean();

  const existingAssignmentIds = new Set(
    existingNotifications.map(n => n.assignmentId),
  );

  /**
   * 3️⃣ Filter assignments that still need notifications
   */
  const assignmentsToNotify = expiringAssignments.filter(
    a => !existingAssignmentIds.has(a._id.toString()),
  );

  if (!assignmentsToNotify.length) {
    return {
      message: 'All expiring assignments already have notifications.',
      totalExpiring: expiringAssignments.length,
    };
  }

  /**
   * 4️⃣ Create notifications (IDs ONLY)
   */
  const notifications = assignmentsToNotify.map(assignment => {
  const now = new Date();

  const daysRemaining =
    assignment.endDate
      ? Math.ceil(
          (assignment.endDate.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  return {
    assignmentId: assignment._id.toString(),
    employeeId: assignment.employeeId
      ? assignment.employeeId.toString()
      : undefined,
    shiftId: assignment.shiftId
      ? assignment.shiftId.toString()
      : undefined,
    title: 'Shift Expiry Warning',
    message: `Assignment ${assignment._id.toString()} is expiring in ${daysRemaining} day(s).`,
    createdAt: new Date(),
  };
});


  /**
   * 5️⃣ Save notifications
   */
  await this.shiftExpiryNotificationModel.insertMany(notifications);

  return {
    totalExpiring: expiringAssignments.length,
    newNotificationsCreated: notifications.length,
  };
}
// ================================================
// USER STORY 4 — READ SHIFT EXPIRY NOTIFICATIONS
// ================================================

async getShiftExpiryNotifications(
  limit = 10,
  offset = 0,
) {
  const notifications = await this.shiftExpiryNotificationModel
    .find()
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

  return notifications.map(n => {
    // Lean documents may not include createdAt depending on schema/timestamps;
    // fall back to ObjectId timestamp if available.
    const anyN = n as any;
    const createdAt =
      anyN.createdAt ?? (anyN._id && typeof anyN._id.getTimestamp === 'function'
        ? anyN._id.getTimestamp()
        : undefined);

    return {
      id: anyN._id.toString(),
      assignmentId: anyN.assignmentId,
      title: anyN.title,
      message: anyN.message,
      createdAt,
    };
  });
}


// ================================================
// USER STORY 5 — CLOCK-IN / CLOCK-OUT (EXCEL IMPORT)
// BR-TM-06
// ================================================

/**
 * Handle a single row from the external Excel sheet.
 * - Finds employee by email
 * - Finds or creates AttendanceRecord for the given date
 * - Adds punch
 * - Recalculates totalWorkMinutes and hasMissedPunch
 */
async logPunchFromExternalSheet(input: {
  employeeIdentifier: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: PunchType;
}) {
  if (!input.employeeIdentifier || !input.date || !input.time || !input.type) {
    throw new BadRequestException(
      'Missing required fields: employeeIdentifier, date, time, type',
    );
  }

  if (!Object.values(PunchType).includes(input.type)) {
    throw new BadRequestException(`Invalid punch type: ${input.type}`);
  }

  const employee = await this.employeeModel.findOne({
    personalEmail: input.employeeIdentifier,
  });

  if (!employee) {
    throw new NotFoundException(
      `Employee not found for identifier: ${input.employeeIdentifier}`,
    );
  }

  const punchDateTime = this.combineDateAndTime(input.date, input.time);

  const attendance = await this.getOrCreateAttendanceRecordForDate(
    employee._id,
    punchDateTime,
  );

  attendance.punches.push({
    type: input.type,
    time: punchDateTime,
  });

  // ⭐ ADD AWAIT HERE
  await this.recalculateAttendanceDerivedFields(attendance);
 
await attendance.save();
await this.processMissedPunchExceptions(attendance); // ⭐ ADD THIS LINE
return attendance;

}
/**
 * Real-time clock-in using employee email.
 */
async clockIn(employeeIdentifier: string) {
  if (!employeeIdentifier) {
    throw new BadRequestException('Employee identifier is required');
  }

  const employee = await this.employeeModel.findOne({
    personalEmail: employeeIdentifier,
  });

  if (!employee) {
    throw new NotFoundException(
      `Employee not found for identifier: ${employeeIdentifier}`,
    );
  }

  const now = new Date();

  const attendance = await this.getOrCreateAttendanceRecordForDate(
    employee._id,
    now,
  );

  if (attendance.punches.length > 0) {
    const lastPunch = attendance.punches[attendance.punches.length - 1];
    if (lastPunch.type === PunchType.IN) {
      throw new BadRequestException('Employee is already clocked in');
    }
  }

  attendance.punches.push({
    type: PunchType.IN,
    time: now,
  });

  await this.recalculateAttendanceDerivedFields(attendance);
await attendance.save();
await this.processMissedPunchExceptions(attendance); 
return attendance;
}

/**
 * Real-time clock-out using employee email.
 */
async clockOut(employeeIdentifier: string) {
  if (!employeeIdentifier) {
    throw new BadRequestException('Employee identifier is required');
  }

  const employee = await this.employeeModel.findOne({
    personalEmail: employeeIdentifier,
  });

  if (!employee) {
    throw new NotFoundException(
      `Employee not found for identifier: ${employeeIdentifier}`,
    );
  }

  const now = new Date();

  const attendance = await this.getOrCreateAttendanceRecordForDate(
    employee._id,
    now,
  );

  if (attendance.punches.length === 0) {
    throw new BadRequestException(
      'Cannot clock out: Employee has not clocked in today',
    );
  }

  const lastPunch = attendance.punches[attendance.punches.length - 1];
  if (lastPunch.type === PunchType.OUT) {
    throw new BadRequestException('Employee is already clocked out');
  }

  attendance.punches.push({
    type: PunchType.OUT,
    time: now,
  });

 await this.recalculateAttendanceDerivedFields(attendance);
await attendance.save();
await this.processMissedPunchExceptions(attendance);
return attendance;
}

// ================================================
// INTERNAL HELPERS
// ================================================

/**
 * Combine date "YYYY-MM-DD" and time "HH:mm" into a Date object.
 */
private combineDateAndTime(dateStr: string, timeStr: string): Date {
  const iso = `${dateStr}T${timeStr}:00`;
  const d = new Date(iso);

  if (isNaN(d.getTime())) {
    throw new BadRequestException(
      `Invalid date/time combination: ${dateStr} ${timeStr}`,
    );
  }

  return d;
}

/**
 * Get or create the AttendanceRecord for a given employee and day.
 * FIXED: Query by attendance.date (not punches.time)
 */
/**
 * Get or create the AttendanceRecord for a given employee and day.
 * Uses a more efficient query strategy.
 */
private async getOrCreateAttendanceRecordForDate(
  employeeId: Types.ObjectId,
  punchDate: Date,
): Promise<AttendanceRecordDocument> {
  const dayStart = new Date(punchDate);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(punchDate);
  dayEnd.setHours(23, 59, 59, 999);

  // 1️⃣ First try: Query by date field (most efficient for clean data)
  let record = await this.attendanceRecordModel.findOne({
    employeeId,
    date: { $gte: dayStart, $lte: dayEnd },
  });

  if (record) {
    return record;
  }

  // 2️⃣ Second try: Find by punch times (handles legacy/dirty data)
  const records = await this.attendanceRecordModel.find({
    employeeId,
    'punches.time': { $gte: dayStart, $lte: dayEnd },
  });

  if (records.length > 0) {
    // If multiple records found for same day, return the first one
    return records[0];
  }

  // 3️⃣ Create new attendance record
  const newRecord = new this.attendanceRecordModel({
    attendanceId: uuidv4(),
    employeeId,
    date: dayStart,
    punches: [],
    totalWorkMinutes: 0,
    hasMissedPunch: false,
    exceptionIds: [],
    finalisedForPayroll: false,
    status: 'PRESENT',
  });

  return newRecord;
}

/**
 * Recalculate totalWorkMinutes and hasMissedPunch
 * Supports both FIRST_LAST and MULTIPLE punch policies
 */
/**
 * Recalculate totalWorkMinutes and hasMissedPunch
 * Supports both FIRST_LAST and MULTIPLE punch policies
 */
private async recalculateAttendanceDerivedFields(
  record: AttendanceRecordDocument,
) {
  if (!record.punches || record.punches.length === 0) {
    record.totalWorkMinutes = 0;
    record.hasMissedPunch = false;
    return;
  }

  // Sort punches by time
  const punches = [...record.punches].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  );

  const firstPunch = punches[0];
  const lastPunch = punches[punches.length - 1];

  // ⚠️ REMOVED: Don't skip calculation if last punch is IN
  // We need to calculate what we have so far

  // Get punch policy for this employee
  let punchPolicy: PunchPolicy;
  try {
    punchPolicy = await this.getPunchPolicyForEmployee(
      record.employeeId,
      new Date(firstPunch.time),
    );
  } catch (error) {
    // If can't get policy, default to MULTIPLE
    punchPolicy = PunchPolicy.MULTIPLE;
  }

  // ==================
  // FIRST_LAST MODE
  // ==================
  if (punchPolicy === PunchPolicy.FIRST_LAST) {
    const firstIn = punches.find((p) => p.type === PunchType.IN);
    const lastOut = [...punches].reverse().find((p) => p.type === PunchType.OUT);

    if (!firstIn) {
      record.totalWorkMinutes = 0;
      record.hasMissedPunch = true;
      return;
    }

    if (!lastOut) {
      // Has IN but no OUT yet - incomplete day
      record.hasMissedPunch = true;
      // Don't calculate totalWorkMinutes for incomplete day
      return;
    }

    const firstTime = new Date(firstIn.time);
    const lastTime = new Date(lastOut.time);

    if (lastTime <= firstTime) {
      record.totalWorkMinutes = 0;
      record.hasMissedPunch = true;
      return;
    }

    const diffMs = lastTime.getTime() - firstTime.getTime();
    const minutes = Math.round(diffMs / 60000);

    record.totalWorkMinutes = minutes;
    record.hasMissedPunch = lastPunch.type === PunchType.IN; // Still clocked in
    return;
  }

  // ==================
  // MULTIPLE MODE
  // ==================
  let totalMinutes = 0;
  let expectingOut = false;
  let lastInTime: Date | null = null;
  let hasMissed = false;

  for (const punch of punches) {
    const punchTime = new Date(punch.time);

    if (punch.type === PunchType.IN) {
      // If we were already expecting OUT, we have overlapping IN punches
      if (expectingOut) {
        hasMissed = true;
      }
      lastInTime = punchTime;
      expectingOut = true;
    } else if (punch.type === PunchType.OUT) {
      // OUT punch without matching IN
      if (!expectingOut || !lastInTime) {
        hasMissed = true;
        continue;
      }

      // Calculate work duration for this pair
      const diffMs = punchTime.getTime() - lastInTime.getTime();
      const diffMinutes = Math.max(0, Math.round(diffMs / 60000));
      totalMinutes += diffMinutes;

      expectingOut = false;
      lastInTime = null;
    }
  }

  // If still expecting OUT at the end, day is incomplete
  if (expectingOut) {
    record.hasMissedPunch = true;
  } else {
    record.hasMissedPunch = hasMissed;
  }

  // ✅ ALWAYS SET totalWorkMinutes (even if incomplete)
  record.totalWorkMinutes = totalMinutes;
}

/**
 * Get punch policy for an employee on a specific date
 */
/**
 * Get punch policy for an employee on a specific date
 */
private async getPunchPolicyForEmployee(
  employeeId: Types.ObjectId,
  targetDate: Date,
): Promise<PunchPolicy> {
  // Convert to string for comparison
  const employeeIdString = employeeId.toString();

  // Find active shift assignments for this employee on target date
  const assignments = await this.shiftAssignmentModel
    .find({
      $and: [
        {
          $or: [
            { employeeId: employeeId },
            { employeeId: employeeIdString },
          ],
        },
        { startDate: { $lte: targetDate } },
        {
          $or: [
            { endDate: null },
            { endDate: { $gte: targetDate } },
          ],
        },
      ],
    })
    .sort({ startDate: -1 })
    .populate('shiftId')
    .exec();

  // If no assignment found, default to MULTIPLE
  if (!assignments || assignments.length === 0) {
    return PunchPolicy.MULTIPLE;
  }

  // Get the most recent assignment
  const latestAssignment = assignments[0];

  // Check if shiftId is populated and has punchPolicy
  if (
    latestAssignment.shiftId &&
    typeof latestAssignment.shiftId === 'object' &&
    'punchPolicy' in latestAssignment.shiftId
  ) {
    return (latestAssignment.shiftId as any).punchPolicy;
  }

  // Default fallback
  return PunchPolicy.MULTIPLE;
}
  // ==================================
  // NO ASSIGNMENTS → DEFAULT MULTIPLE
  // ==================================




// ================================================
// ATTENDANCE — SERVICE METHODS (CONTROLLER SUPPORT)
// ================================================

async getAttendanceRecords(params?: {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const query: any = {
    finalisedForPayroll: { $ne: true }, // ← Only show unfinalized records
  };

  if (params?.employeeId) {
    query.employeeId = new Types.ObjectId(params.employeeId);
  }

  if (params?.startDate || params?.endDate) {
    query['punches.time'] = {}; // ← Changed from 'date' to 'punches.time'
    if (params.startDate) {
      query['punches.time'].$gte = new Date(params.startDate);
    }
    if (params.endDate) {
      query['punches.time'].$lte = new Date(params.endDate);
    }
  }

  const page = Number(params?.page) || 1;
  const limit = Number(params?.limit) || 10;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.attendanceRecordModel
      .find(query)
      .populate("employeeId", "firstName lastName personalEmail workEmail")
      .sort({ createdAt: -1 }) // ← Changed from 'date' to 'createdAt'
      .skip(skip)
      .limit(limit)
      .exec(),

    this.attendanceRecordModel.countDocuments(query),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
async getDepartmentAttendanceRecords(
  managerUser: any,
  params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }
) {
  /**
   * STEP 1: Resolve manager employee profile
   */
  const managerEmployee = await this.employeeModel.findOne({
    userId: new Types.ObjectId(managerUser._id),
  });

  if (!managerEmployee?.primaryDepartmentId) {
    throw new BadRequestException(
      "Manager does not belong to a primary department"
    );
  }

  const departmentId = managerEmployee.primaryDepartmentId;

  /**
   * STEP 2: Get all employees in the same department
   */
  const departmentEmployees = await this.employeeModel
    .find(
      { primaryDepartmentId: departmentId },
      { _id: 1 }
    )
    .lean();

  const employeeIds = departmentEmployees.map(e => e._id);

  if (employeeIds.length === 0) {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: Number(params?.limit) || 10,
      totalPages: 0,
    };
  }

  /**
   * STEP 3: Build attendance query (same logic as existing)
   */
  const query: any = {
    finalisedForPayroll: { $ne: true },
    employeeId: { $in: employeeIds },
  };

  if (params?.startDate || params?.endDate) {
    query["punches.time"] = {};
    if (params.startDate) {
      query["punches.time"].$gte = new Date(params.startDate);
    }
    if (params.endDate) {
      query["punches.time"].$lte = new Date(params.endDate);
    }
  }

  /**
   * STEP 4: Pagination
   */
  const page = Number(params?.page) || 1;
  const limit = Number(params?.limit) || 10;
  const skip = (page - 1) * limit;

  /**
   * STEP 5: Query attendance records
   */
  const [data, total] = await Promise.all([
    this.attendanceRecordModel
      .find(query)
      .populate(
        "employeeId",
        "firstName lastName personalEmail workEmail primaryDepartmentId"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),

    this.attendanceRecordModel.countDocuments(query),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

async getAttendanceRecordsFinalized(params?: {
  page?: number;
  limit?: number;
}) {
  const query = {
    finalisedForPayroll: true,
  };

  const page = Number(params?.page) || 1;
  const limit = Number(params?.limit) || 10;
  const skip = (page - 1) * limit;

  const data = await this.attendanceRecordModel
    .find(query)
    .populate("employeeId", "firstName lastName personalEmail workEmail")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  console.log("🔥 finalized count:", data.length);

  // 🔍 Inspect EACH record safely
  for (const r of data) {
    try {
      if (!r._id) {
        console.error("❌ Record missing _id:", r);
      }

      if (!r.employeeId) {
        console.error("❌ Record missing employeeId:", r._id);
      }

      if (r.punches && !Array.isArray(r.punches)) {
        console.error("❌ punches not array:", r._id);
      }

      if (Array.isArray(r.punches)) {
        for (const p of r.punches) {
          if (!p.time || isNaN(new Date(p.time).getTime())) {
            console.error("❌ Invalid punch time:", {
              recordId: r._id,
              punch: p,
            });
          }
        }
      }

      // 🔥 Force JSON serialization test
      JSON.stringify(r);
    } catch (err) {
      console.error("💥 SERIALIZATION FAILED FOR RECORD:", r._id);
      console.error(err);
    }
  }

  const total = await this.attendanceRecordModel.countDocuments(query);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
/**
 * US9 — Finalize single attendance record by ID
 */
async finalizeSingleRecord(recordId: string) {
  const record = await this.attendanceRecordModel.findById(recordId);

  if (!record) {
    throw new NotFoundException('Attendance record not found');
  }

  if (record.finalisedForPayroll) {
    throw new BadRequestException('Record is already finalized');
  }

  if (record.hasMissedPunch) {
    throw new BadRequestException('Cannot finalize incomplete record (has missed punch)');
  }

  record.finalisedForPayroll = true;
  await record.save();

  return {
    success: true,
    message: 'Attendance record finalized successfully',
    recordId: record._id,
  };
}

/**
 * US9 — Finalize all complete attendance records (with optional date filters)
 */
async finalizeAllCompleteRecords(filters: {
  startDate?: Date;
  endDate?: Date;
}) {
  const query: any = {
    hasMissedPunch: false, // Only complete records
    finalisedForPayroll: false, // Not already finalized
  };

  // Apply date filters if provided
  if (filters.startDate || filters.endDate) {
    query['punches.time'] = {};
    if (filters.startDate) {
      query['punches.time'].$gte = filters.startDate;
    }
    if (filters.endDate) {
      query['punches.time'].$lte = filters.endDate;
    }
  }

  const result = await this.attendanceRecordModel.updateMany(
    query,
    { $set: { finalisedForPayroll: true } },
  );

  return {
    success: true,
    finalized: result.modifiedCount,
    message: `${result.modifiedCount} complete attendance record(s) finalized for payroll.`,
  };
}

async getAttendanceRecordById(id: Types.ObjectId) {
  const record = await this.attendanceRecordModel
    .findById(id)
    .populate('employeeId', 'firstName lastName personalEmail')
    .exec();

  if (!record) {
    throw new NotFoundException(`Attendance record not found: ${id}`);
  }

  return record;
}

async getAttendanceStats(params?: {
  startDate?: string;
  endDate?: string;
}) {
  const query: any = {};

  if (params?.startDate || params?.endDate) {
    query.date = {};
    if (params.startDate) {
      query.date.$gte = new Date(params.startDate);
    }
    if (params.endDate) {
      query.date.$lte = new Date(params.endDate);
    }
  }

  const records = await this.attendanceRecordModel.find(query).lean();

  // Today range
  const today = new Date();
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const todayRecords = await this.attendanceRecordModel.find({
    date: { $gte: todayStart, $lte: todayEnd },
  });

  const totalEmployees = await this.employeeModel.countDocuments();

  const presentToday = todayRecords.filter(
    (r: any) => r.status === 'PRESENT',
  ).length;

  const absentToday = Math.max(0, totalEmployees - presentToday);

  const totalMinutes = records.reduce(
    (sum: number, r: any) => sum + (r.totalWorkMinutes || 0),
    0,
  );

  const averageHours =
    records.length > 0 ? totalMinutes / records.length / 60 : 0;

  return {
    totalEmployees,
    presentToday,
    absentToday,
    averageHours,
  };
}


  // ================================================
// USER STORY 6 — MANUAL ATTENDANCE CORRECTION
// BR-TM-06, BR-TM-24
// ================================================

  /**
   * Line Manager manually corrects attendance for an employee.
   * This supports:
   * - Missing IN punch
   * - Missing OUT punch
   * - Fully replacing the punches of the day
   * - Adding new punch
   *
   * Automatically:
   * - Creates AttendanceCorrectionRequest
   * - Logs audit trail
   * - Recalculates total work minutes + missed punch flag
   */
  async correctAttendance(body: any) {
  const { employee, date, newPunches, reason, managerId } = body;

  if (!employee || !date || !newPunches || !reason || !managerId) {
    throw new BadRequestException("Missing required fields");
  }

  const employeeDoc = await this.employeeModel.findOne({
    personalEmail: employee,
  });

  if (!employeeDoc) {
    throw new NotFoundException(`Employee not found: ${employee}`);
  }
  // 2️⃣ Resolve manager
  const manager = await this.employeeModel.findById(managerId);

  if (!manager) {
  throw new NotFoundException(`Manager not found for ID: ${managerId}`);
  }


  const employeeId = employeeDoc._id;

  const dateStart = new Date(`${date}T00:00:00`);
  const dateEnd = new Date(`${date}T23:59:59`);

  let record = await this.attendanceRecordModel.findOne({
    employeeId,
    "punches.time": { $gte: dateStart, $lte: dateEnd },
  });

  if (!record) {
    record = new this.attendanceRecordModel({
      employeeId,
      punches: [],
      totalWorkMinutes: 0,
      hasMissedPunch: false,
      exceptionIds: [],
      finalisedForPayroll: false,
      date: dateStart,
    });
  }

  // Replace punches
  record.punches = newPunches.map((p: any) => ({
    type: p.type,
    time: new Date(`${date}T${p.time}:00`),
  }));

  // Recalculate
  this.recalculateAttendanceDerivedFields(record);
  record.finalisedForPayroll = false;

  await record.save();

  // Auto exceptions
  const exceptions: TimeExceptionDocument[] = [];

  if (record.hasMissedPunch) {
    const exc = await this.timeExceptionModel.create({
      employeeId,
      attendanceRecordId: record._id,
      assignedTo: managerId,
      type: TimeExceptionType.MISSED_PUNCH,
      reason: reason,
      status: TimeExceptionStatus.OPEN,
    });

    exceptions.push(exc);
  }

  record.exceptionIds = exceptions.map(e => e._id);
  await record.save();

  return {
    message: "Attendance corrected successfully",
    attendance: record,
    exceptions,
  };
}

private async generateTimeExceptions(
  record: AttendanceRecordDocument,
  employeeId: string,
  hrAdminId: string,
  reason: string
) {
  const exceptions: TimeExceptionDocument[] = [];  // ← FIXED TYPE

  if (record.hasMissedPunch) {
    const exc = await this.timeExceptionModel.create({
      employeeId,
      attendanceRecordId: record._id,
      assignedTo: hrAdminId,
      type: TimeExceptionType.MISSED_PUNCH,
      reason,
      status: TimeExceptionStatus.OPEN,
    });

    exceptions.push(exc);
  }

  return exceptions;
}





// ============================================================================
// USER STORY 7 — FLEXIBLE PUNCH HANDLING (FINAL UPDATED VERSION)
// BR-TM-11
// ============================================================================

/**
 * Resolve the punch policy for an employee on a specific date.
 * Policies:
 *  - MULTIPLE: Accept all punches
 *  - FIRST_LAST: First IN + Last OUT only
 *  - ONLY_FIRST: Only first IN (ignore all OUT)
 */
private async getPunchPolicyForEmployeeOnDate(
  employeeId: Types.ObjectId,
  date: Date,
): Promise<PunchPolicy> {
  const assignment = await this.shiftAssignmentModel
    .findOne({
      employeeId,
      startDate: { $lte: date },
      $or: [{ endDate: { $gte: date } }, { endDate: null }],
      status: 'APPROVED',
    })
    .populate<{ shiftId: Shift }>('shiftId');

  // No assignment → Default to multiple punches
  if (!assignment || !assignment.shiftId) {
    return PunchPolicy.MULTIPLE;
  }

  // Always fallback to MULTIPLE if undefined
  return assignment.shiftId.punchPolicy ?? PunchPolicy.MULTIPLE;
}

/**
 * Apply punch policy logic to incoming punch.
 */
private async applyPunchPolicy(
  employeeId: Types.ObjectId,
  record: AttendanceRecordDocument,
  incomingPunch: { type: PunchType; time: Date },
) {
  const policy = await this.getPunchPolicyForEmployeeOnDate(
    employeeId,
    incomingPunch.time,
  );

  // MULTIPLE — Accept absolutely all punches
  if (policy === PunchPolicy.MULTIPLE) {
    record.punches.push(incomingPunch);
    return;
  }

  // Ensure we work with sorted punches
  const punches = record.punches.sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  );

  // ========================================================================
  // FIRST_LAST POLICY
  // ========================================================================
  if (policy === PunchPolicy.FIRST_LAST) {
    // First IN only
    if (incomingPunch.type === PunchType.IN) {
      const hasIn = punches.some((p) => p.type === PunchType.IN);
      if (!hasIn) record.punches.push(incomingPunch);
      return;
    }

    // Always replace last OUT
    if (incomingPunch.type === PunchType.OUT) {
      const outs = punches.filter((p) => p.type === PunchType.OUT);

      // If OUT exists → update last one
      if (outs.length > 0) {
        outs[outs.length - 1].time = incomingPunch.time;
      } else {
        record.punches.push(incomingPunch);
      }
      return;
    }
  }

  // ========================================================================
  // ONLY_FIRST POLICY
  // ========================================================================
  if (policy === PunchPolicy.ONLY_FIRST) {
    if (incomingPunch.type === PunchType.IN) {
      const hasIn = punches.some((p) => p.type === PunchType.IN);
      if (!hasIn) record.punches.push(incomingPunch);
    }
    // Ignore all OUT punches entirely
    return;
  }
}

private async getPunchPolicyForDate(
  employeeId: Types.ObjectId,
  attendanceDate: Date
): Promise<PunchPolicy> {

  const dayStart = new Date(attendanceDate);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(attendanceDate);
  dayEnd.setHours(23, 59, 59, 999);

  const assignments = await this.shiftAssignmentModel
    .find({
      employeeId,
      startDate: { $lte: dayEnd },
      $or: [
        { endDate: null },
        { endDate: { $gte: dayStart } }
      ]
    })
    .sort({ createdAt: -1 })
    .populate({
      path: "shiftId",
      model: "Shift", // <-- IMPORTANT FIX
    });

  // If no assignments, default
  if (!assignments || assignments.length === 0) {
    return PunchPolicy.MULTIPLE;
  }

  const shift = assignments[0].shiftId as any;

  // If still not populated, fallback
  if (!shift || !shift.punchPolicy) {
    return PunchPolicy.MULTIPLE;
  }

  return shift.punchPolicy;
}



// ============================================================================
// USER STORY 8 — MISSED PUNCH MANAGEMENT
// BR-TM-14
// ============================================================================

private async createMissedPunchException(
  employeeId: Types.ObjectId,
  attendanceRecordId: Types.ObjectId,
  reason: string,
) {
  const exception = new this.timeExceptionModel({
    employeeId,
    attendanceRecordId,
    type: TimeExceptionType.MISSED_PUNCH,
    status: TimeExceptionStatus.OPEN,
    reason,
    assignedTo: employeeId,
  });
  await exception.save();
  return exception;
}

private async notifyMissedPunch(
  employeeId: Types.ObjectId,
  attendanceRecordId: Types.ObjectId,
) {
  const employee = await this.employeeModel
    .findById(employeeId)
    .exec();

  if (!employee) {
    console.error(`Employee not found: ${employeeId}`);
    return;
  }

  const employeeName = employee.fullName || `${employee.firstName} ${employee.lastName}`;

  console.log('🔍 Employee Details:', {
    id: employee._id,
    name: employeeName,
    supervisorPositionId: employee.supervisorPositionId,
  });

  // 1️⃣ Notify the employee
  const employeeNotification = new this.notificationLogModel({
    to: employeeId,
    type: 'MISSED_PUNCH',
    message: `You have a missing punch detected. Please submit a correction request for your attendance record.`,
    metadata: {
      attendanceRecordId: attendanceRecordId.toString(),
      employeeName,
    },
  });
  await employeeNotification.save();
  console.log('✅ Employee notification created');

  // 2️⃣ Find and notify supervisor (if exists)
  if (employee.supervisorPositionId) {
    console.log('🔍 Looking for supervisor with primaryPositionId:', employee.supervisorPositionId);

    // Try multiple approaches to find supervisor
    const supervisors = await this.employeeModel.find({
      primaryPositionId: employee.supervisorPositionId,
    });

    console.log('🔍 Found supervisors:', supervisors.length);
    supervisors.forEach(s => {
      console.log('  -', s._id, s.fullName, 'Status:', s.status);
    });

    // Filter for active supervisor
    const supervisor = supervisors.find(s => s.status === 'ACTIVE');

    if (supervisor) {
      console.log('✅ Active supervisor found:', supervisor.fullName);
      
      const supervisorNotification = new this.notificationLogModel({
        to: supervisor._id,
        type: 'MISSED_PUNCH_SUPERVISOR',
        message: `Employee ${employeeName} has a missing punch. Please review and take action.`,
        metadata: {
          attendanceRecordId: attendanceRecordId.toString(),
          employeeId: employeeId.toString(),
          employeeName,
        },
      });
      await supervisorNotification.save();
      console.log('✅ Supervisor notification created');
    } else {
      console.log('⚠️ No active supervisor found for position:', employee.supervisorPositionId);
      
      // Additional debugging: Check if position exists at all
      const allEmployeesWithPosition = await this.employeeModel.find({
        primaryPositionId: employee.supervisorPositionId,
      });
      console.log('📋 All employees with this position (any status):', allEmployeesWithPosition.map(e => ({
        id: e._id,
        name: e.fullName,
        status: e.status
      })));
    }
  } else {
    console.log('ℹ️ Employee has no supervisor assigned');
  }
}


private async processMissedPunchExceptions(
  attendance: AttendanceRecordDocument,
) {
  if (!attendance.hasMissedPunch) return;

  const existing = await this.timeExceptionModel.findOne({
    attendanceRecordId: attendance._id,
    type: TimeExceptionType.MISSED_PUNCH,
    status: TimeExceptionStatus.OPEN,
  });

  if (existing) return;

  const exception = await this.createMissedPunchException(
    attendance.employeeId,
    attendance._id,
    'System detected missing punch(es) for this day.',
  );

  await this.notifyMissedPunch(attendance.employeeId, attendance._id);

  if (!attendance.exceptionIds.includes(exception._id)) {
    attendance.exceptionIds.push(exception._id);
    await attendance.save();
  }
}

async scanAndProcessMissedPunches(params?: {
  startDate?: string;
  endDate?: string;
}) {
  const query: any = {
    hasMissedPunch: true,
  };

  if (params?.startDate || params?.endDate) {
    query.date = {};
    if (params.startDate) {
      query.date.$gte = new Date(params.startDate);
    }
    if (params.endDate) {
      query.date.$lte = new Date(params.endDate);
    }
  }

  const attendanceRecords = await this.attendanceRecordModel.find(query);

  let processed = 0;
  for (const record of attendanceRecords) {
    await this.processMissedPunchExceptions(record);
    processed++;
  }

  return {
    totalScanned: attendanceRecords.length,
    processed,
  };
}

async getMissedPunchExceptions(params?: {
  status?: string;
  employeeId?: string;
}) {
  const query: any = {
    type: TimeExceptionType.MISSED_PUNCH,
  };

  if (params?.status) {
    query.status = params.status;
  }

  if (params?.employeeId) {
    query.employeeId = params.employeeId;
  }

  const exceptions = await this.timeExceptionModel
    .find(query)
    .populate('employeeId', 'firstName lastName fullName personalEmail')
    .populate('attendanceRecordId')
    .sort({ createdAt: -1 })
    .exec();

  return exceptions;
}
/* ============================================================================
   USER STORY 9 — Attendance-to-Payroll Sync
   BR-TM-22: "All time management data must sync daily with payroll, benefits,
             and leave modules."
   ============================================================================
*/
private buildPayrollSyncPayload(attendance: AttendanceRecordDocument) {
  return {
    employeeId: attendance.employeeId,
    attendanceRecordId: attendance._id,
    totalWorkMinutes: attendance.totalWorkMinutes,
    hasMissedPunch: attendance.hasMissedPunch,
    punches: attendance.punches.map((p) => ({
      type: p.type,
      time: p.time,
    })),
    date:
      attendance.punches.length > 0
        ? new Date(attendance.punches[0].time).toISOString().split('T')[0]
        : null,
  };
}

/* ============================================================================
   2. HELPER — Send Data to Payroll System (stub)
   ============================================================================
*/
private async sendToPayrollSystems(payload: any) {
  // TODO: Replace with actual HTTP call to Payroll API
  console.log('Syncing with Payroll system:', payload);
}

/* ============================================================================
   3. HELPER — Send Data to Leave Subsystem (stub)
   ============================================================================
*/
private async sendToLeaveSystem(payload: any) {
  // TODO: Replace with actual HTTP call to Leaves API
  console.log('Syncing with Leaves subsystem:', payload);
}

/* ============================================================================
   4. CORE LOGIC — Sync Attendance Records with Payroll
   ============================================================================
*/
private async syncAttendanceWithPayroll() {
  // Find records ready for payroll
  const recordsToSync = await this.attendanceRecordModel.find({
    finalisedForPayroll: true,
    syncedWithPayroll: { $ne: true }, // optional field in schema
  });

  if (recordsToSync.length === 0) return;

  for (const record of recordsToSync) {
    const payload = this.buildPayrollSyncPayload(record);

    // Send to Payroll System
    await this.sendToPayrollSystems(payload);

    // Send to Leave Subsystem
    await this.sendToLeaveSystem(payload);

    // Mark as synced
    record.finalisedForPayroll = true;
    await record.save();
  }
}

/* ============================================================================
   5. CRON JOB — Daily Sync at 02:00 AM
   ============================================================================
*/
@Cron(CronExpression.EVERY_DAY_AT_2AM)
async runDailyPayrollSync() {
  console.log('Starting daily attendance-to-payroll sync...');
  await this.syncAttendanceWithPayroll();
  console.log('Daily payroll sync completed.');
}

// ============================================================================
// USER STORY 10 — OVERTIME & SHORT TIME CONFIGURATION
// BR-TM-08
// ============================================================================


// ============================================================================
// 1. HELPER — Validate rule based on BR-TM-08
// ============================================================================
private validateOvertimeRuleInput(dto: {
  name: string;
  description?: string;
}) {
  if (!dto.name || dto.name.trim().length === 0) {
    throw new BadRequestException('Rule name is required.');
  }

  // Prevent meaningless names
  const forbidden = ['invalid', 'none', 'test', 'placeholder'];
  if (forbidden.includes(dto.name.toLowerCase())) {
    throw new BadRequestException('Invalid rule name.');
  }

  // BR-TM-08 requires rule clarity
  if (dto.description && dto.description.length < 3) {
    throw new BadRequestException('Description is too short.');
  }
}

// ============================================================================
// 2. CREATE OVERTIME RULE
// ============================================================================
async createOvertimeRule(dto: {
  name: string;
  description?: string;
}) {
  this.validateOvertimeRuleInput(dto);

  // Prevent duplicates
  const exists = await this.overtimeRuleModel.findOne({ name: dto.name });
  if (exists) {
    throw new BadRequestException('An overtime rule with this name already exists.');
  }

  const rule = new this.overtimeRuleModel({
    name: dto.name,
    description: dto.description ?? '',
    active: true,
    approved: false, // HR must approve
  });

  await rule.save();
  return rule;
}

// ============================================================================
// 3. UPDATE OVERTIME RULE
// ============================================================================
async updateOvertimeRule(
  ruleId: Types.ObjectId,
  dto: { name?: string; description?: string; active?: boolean }
) {
  const rule = await this.overtimeRuleModel.findById(ruleId);
  if (!rule) throw new NotFoundException('Overtime rule not found.');

  if (dto.name) rule.name = dto.name;
  if (dto.description !== undefined) rule.description = dto.description;
  if (dto.active !== undefined) rule.active = dto.active;

  this.validateOvertimeRuleInput({ name: rule.name, description: rule.description });

  await rule.save();
  return rule;
}

// ============================================================================
// 4. APPROVE RULE
// ============================================================================
async approveOvertimeRule(ruleId: Types.ObjectId) {
  const rule = await this.overtimeRuleModel.findById(ruleId);
  if (!rule) throw new NotFoundException('Overtime rule not found.');

  if (rule.approved) {
    throw new BadRequestException('Rule is already approved.');
  }

  rule.approved = true;
  await rule.save();
  return rule;
}

// ============================================================================
// 5. ACTIVATE / DEACTIVATE RULE
// ============================================================================
async toggleOvertimeRule(ruleId: Types.ObjectId, activate: boolean) {
  const rule = await this.overtimeRuleModel.findById(ruleId);
  if (!rule) throw new NotFoundException('Overtime rule not found.');

  rule.active = activate;
  await rule.save();
  return rule;
}

// ============================================================================
// 6. LIST RULES
// ============================================================================
async listOvertimeRules(filter?: { active?: boolean }) {
  const query: any = {};
  if (filter?.active !== undefined) query.active = filter.active;

  return this.overtimeRuleModel.find(query);
}
// ============================================================================
// USER STORY 11 — LATENESS & PENALTY RULE MANAGEMENT
// BR-TM-09: Lateness must follow HR rules (grace period, thresholds, penalty)
// ============================================================================

// ============================================================================
// 1. HELPER — Validate lateness rule inputs (BR-TM-09)
// ============================================================================
private validateLatenessRuleInput(dto: {
  name: string;
  description?: string;
  gracePeriodMinutes?: number;
  deductionForEachMinute?: number;
}) {
  if (!dto.name || dto.name.trim().length < 2) {
    throw new BadRequestException('Rule name is required and must be valid.');
  }

  // Prevent meaningless names
  const forbidden = ['test', 'invalid', 'placeholder', 'none'];
  if (forbidden.includes(dto.name.toLowerCase())) {
    throw new BadRequestException('Invalid rule name.');
  }

  if (dto.gracePeriodMinutes !== undefined && dto.gracePeriodMinutes < 0) {
    throw new BadRequestException('Grace period cannot be negative.');
  }

  if (
    dto.deductionForEachMinute !== undefined &&
    dto.deductionForEachMinute < 0
  ) {
    throw new BadRequestException('Deduction cannot be negative.');
  }
}

// ============================================================================
// 2. CREATE LATENESS RULE
// ============================================================================
async createLatenessRule(dto: {
  name: string;
  description?: string;
  gracePeriodMinutes: number;
  deductionForEachMinute: number;
}) {
  this.validateLatenessRuleInput(dto);

  // Check duplicates
  const exists = await this.latenessRuleModel.findOne({ name: dto.name });
  if (exists) {
    throw new BadRequestException(
      'A lateness rule with this name already exists.',
    );
  }

  const rule = new this.latenessRuleModel({
    name: dto.name,
    description: dto.description ?? '',
    gracePeriodMinutes: dto.gracePeriodMinutes,
    deductionForEachMinute: dto.deductionForEachMinute,
    active: true,
  });

  await rule.save();
  return rule;
}

// ============================================================================
// 3. UPDATE LATENESS RULE
// ============================================================================
async updateLatenessRule(
  ruleId: Types.ObjectId,
  dto: {
    name?: string;
    description?: string;
    gracePeriodMinutes?: number;
    deductionForEachMinute?: number;
    active?: boolean;
  },
) {
  const rule = await this.latenessRuleModel.findById(ruleId);
  if (!rule) throw new NotFoundException('Lateness rule not found.');

  if (dto.name) rule.name = dto.name;
  if (dto.description !== undefined) rule.description = dto.description;
  if (dto.gracePeriodMinutes !== undefined)
    rule.gracePeriodMinutes = dto.gracePeriodMinutes;
  if (dto.deductionForEachMinute !== undefined)
    rule.deductionForEachMinute = dto.deductionForEachMinute;
  if (dto.active !== undefined) rule.active = dto.active;

  this.validateLatenessRuleInput({
    name: rule.name,
    description: rule.description,
    gracePeriodMinutes: rule.gracePeriodMinutes,
    deductionForEachMinute: rule.deductionForEachMinute,
  });

  await rule.save();
  return rule;
}

// ============================================================================
// 4. ACTIVATE OR DEACTIVATE LATENESS RULE
// ============================================================================
async toggleLatenessRule(ruleId: Types.ObjectId, activate: boolean) {
  const rule = await this.latenessRuleModel.findById(ruleId);
  if (!rule) throw new NotFoundException('Lateness rule not found.');

  rule.active = activate;
  await rule.save();
  return rule;
}

// ============================================================================
// 5. LIST LATENESS RULES (optional filter: active)
// ============================================================================
async listLatenessRules(filter?: { active?: boolean }) {
  const query: any = {};

  if (filter?.active !== undefined) query.active = filter.active;

  return this.latenessRuleModel.find(query);
}

// ============================================================================
// USER STORY 12 — REPEATED LATENESS HANDLING
// BR-TM-09: Apply lateness/penalty rules
// BR-TM-16: Escalate repeated lateness
// ============================================================================


// ============================================================================
// 1. HELPER — Calculate lateness using grace period
// ============================================================================


// ============================================================================
// 2. HELPER — Count lateness incidents in last X days
// ============================================================================
async countLatenessExceptions(
  employeeId: Types.ObjectId,
  days: number,
) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return this.timeExceptionModel.countDocuments({
    employeeId,
    type: TimeExceptionType.LATE,
    createdAt: { $gte: since },
  });
}

// ============================================================================
// 3. HELPER — Extract attendance date from punches
// ============================================================================
private getAttendanceDate(
  punches: { type: string; time: Date }[],
): string | null {
  const firstIn = punches
    .filter((p) => p.type === 'IN')
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())[0];

  if (!firstIn) return null;

  return new Date(firstIn.time).toISOString().split('T')[0];
}

// ============================================================================
// 4. CORE LOGIC — Repeated lateness handling
// ============================================================================
async handleRepeatedLateness(
  attendance: AttendanceRecordDocument,
  shiftStartTime: string,
) {
  // 1️⃣ Load lateness rule
  const rule = await this.latenessRuleModel.findOne({ active: true });
  if (!rule) return;

  // 2️⃣ Calculate lateness
  const minutesLate = this.calculateMinutesLate(
    attendance.punches,
    shiftStartTime,
    rule.gracePeriodMinutes,
  );

  if (minutesLate <= 0) return;

  // 3️⃣ Create lateness exception (operational)
  await this.timeExceptionModel.create({
    employeeId: attendance.employeeId,
    attendanceRecordId: attendance._id,
    type: TimeExceptionType.LATE,
    status: TimeExceptionStatus.OPEN,
    reason: `Late by ${minutesLate} minutes`,
    assignedTo: attendance.employeeId, // manager assignment later
  });

  // 4️⃣ Count lateness incidents (last 30 days)
  const incidents = await this.countLatenessExceptions(
    attendance.employeeId,
    30,
  );

  const threshold = 3; // configurable later
  if (incidents < threshold) return;

  // 5️⃣ Escalation exception (disciplinary signal)
  await this.timeExceptionModel.create({
    employeeId: attendance.employeeId,
    attendanceRecordId: attendance._id,
    type: TimeExceptionType.LATE,
    status: TimeExceptionStatus.ESCALATED,
    reason: `Repeated lateness detected (${incidents} times in 30 days)`,
    assignedTo: attendance.employeeId,
  });

  // 6️⃣ Notify HR Admins / Managers
  const attendanceDate = this.getAttendanceDate(attendance.punches);

  const hrUsers = await this.employeeSystemRoleModel.find({
  roles: {
    $in: [SystemRole.HR_ADMIN, SystemRole.HR_MANAGER],
  },
  isActive: true,
});


  await Promise.all(
    hrUsers.map((hr) =>
      this.notificationLogModel.create({
        to: hr._id,
        type: 'EMPLOYEE_LATE',
        message: `Employee ${attendance.employeeId} was late on ${attendanceDate}. Total lateness incidents in last 30 days: ${incidents}.`,
      }),
    ),
  );
}
// ============================================================================
// REBUILD HR LATENESS NOTIFICATIONS (FOR CURRENT HR USER ONLY)
// ============================================================================
async rebuildLatenessNotifications(
  hrUserId: Types.ObjectId,
  days = 30,
) {
  console.log('[rebuildLatenessNotifications] START', {
    hrUserId: hrUserId.toString(),
    days,
  });

  // 1️⃣ Delete old lateness notifications for THIS HR user
  await this.notificationLogModel.deleteMany({
    type: 'EMPLOYEE_LATE',
    to: hrUserId,
  });

  const since = new Date();
  since.setDate(since.getDate() - days);

  console.log('[rebuildLatenessNotifications] Considering records since', {
    since: since.toISOString().split('T')[0],
  });

  // 2️⃣ Load attendance records that actually have punches
  const attendanceRecords = await this.attendanceRecordModel.find({
    punches: { $exists: true, $not: { $size: 0 } },
  });

  console.log('[rebuildLatenessNotifications] Attendance records loaded', {
    count: attendanceRecords.length,
  });

  let createdCount = 0;

  for (const attendance of attendanceRecords) {
    const attendanceId = attendance._id.toString();

    // 3️⃣ Attendance date from punches (first IN)
    const attendanceDateStr = this.getAttendanceDate(attendance.punches);
    if (!attendanceDateStr) {
      console.log('[rebuildLatenessNotifications] Skipping: no attendance date', {
        attendanceId,
      });
      continue;
    }

    const attendanceDate = new Date(attendanceDateStr);

    // consider only records in last `days`
    if (attendanceDate < since) {
      console.log('[rebuildLatenessNotifications] Skipping: outside window', {
        attendanceId,
        attendanceDate: attendanceDateStr,
      });
      continue;
    }

    // 4️⃣ Resolve shift assignment for that date
    const shiftAssignment = await this.shiftAssignmentModel.findOne({
      employeeId: attendance.employeeId,
      startDate: { $lte: attendanceDate },
      $or: [{ endDate: null }, { endDate: { $gte: attendanceDate } }],
    });

    if (!shiftAssignment) {
      console.log('[rebuildLatenessNotifications] Skipping: no shift assignment', {
        attendanceId,
        attendanceDate: attendanceDateStr,
      });
      continue;
    }

    const shift = await this.shiftModel.findById(shiftAssignment.shiftId);
    if (!shift) {
      console.log('[rebuildLatenessNotifications] Skipping: shift not found', {
        attendanceId,
        shiftId: shiftAssignment.shiftId?.toString(),
      });
      continue;
    }

    // 5️⃣ Calculate lateness using Shift.startTime + Shift.graceInMinutes
    const minutesLate = this.calculateMinutesLate(
      attendance.punches,
      shift.startTime,
      shift.graceInMinutes ?? 0,
    );

    console.log('[rebuildLatenessNotifications] Lateness check', {
      attendanceId,
      attendanceDate: attendanceDateStr,
      shiftStartTime: shift.startTime,
      graceInMinutes: shift.graceInMinutes,
      minutesLate,
    });

    if (minutesLate <= 0) {
      console.log('[rebuildLatenessNotifications] Not late under policy', {
        attendanceId,
      });
      continue;
    }

    // 6️⃣ Create notification for current HR user only
    await this.notificationLogModel.create({
      to: hrUserId,
      type: 'EMPLOYEE_LATE',
      message: `Employee ${attendance.employeeId} was late on ${attendanceDateStr} by ${minutesLate} minutes.`,
    });

    console.log('[rebuildLatenessNotifications] Notification created', {
      attendanceId,
      employeeId: attendance.employeeId.toString(),
      attendanceDate: attendanceDateStr,
      minutesLate,
    });

    createdCount++;
  }

  console.log('[rebuildLatenessNotifications] DONE', {
    createdCount,
  });

  return {
    created: createdCount,
  };
}


// ============================================================================
// REBUILD REPEATED LATENESS NOTIFICATIONS (HR USER ONLY)
// BR-TM-16
// ============================================================================

async rebuildRepeatedLatenessNotifications(
  hrUserId: Types.ObjectId,
  days = 30,
  threshold = 3,
) {
  // 1️⃣ Delete old repeated-lateness notifications for this HR user
  await this.notificationLogModel.deleteMany({
    type: 'EMPLOYEE_REPEATED_LATENESS',
    to: hrUserId,
  });

  const since = new Date();
  since.setDate(since.getDate() - days);

  // 2️⃣ Aggregate lateness incidents per employee
  const repeatedLateEmployees = await this.timeExceptionModel.aggregate([
    {
      $match: {
        type: TimeExceptionType.LATE,
        createdAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: '$employeeId',
        count: { $sum: 1 },
      },
    },
    {
      $match: {
        count: { $gte: threshold },
      },
    },
  ]);

  let createdCount = 0;

  // 3️⃣ Create one notification per repeated offender
  for (const record of repeatedLateEmployees) {
    await this.notificationLogModel.create({
      to: hrUserId,
      type: 'EMPLOYEE_REPEATED_LATENESS',
      message: `Employee ${record._id} was late ${record.count} times in the last ${days} days.`,
    });

    createdCount++;
  }

  return {
    created: createdCount,
  };
}
private calculateMinutesLate(
  punches: { type: string; time: Date }[],
  shiftStartTime: string,      // e.g. "08:30"
  gracePeriodMinutes: number,  // from shift.graceInMinutes
  attendanceDateStr?: string,  // "2025-12-15"
): number {
  const firstIn = punches
    .filter((p) => p.type === 'IN')
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())[0];

  if (!firstIn) {
    console.log('[calculateMinutesLate] No IN punches found');
    return 0;
  }

  // 1) build base date (attendance date)
  let baseDate: Date;
  if (attendanceDateStr) {
    baseDate = new Date(attendanceDateStr + 'T00:00:00');
  } else {
    baseDate = new Date(firstIn.time);
    baseDate.setHours(0, 0, 0, 0);
  }

  // 2) scheduled shift datetime on that date
  const [hh, mm] = shiftStartTime.split(':').map(Number);
  const scheduled = new Date(baseDate);
  scheduled.setHours(hh, mm, 0, 0);

  // 3) actual IN datetime
  const actualIn = new Date(firstIn.time);
  const diffMinutes =
    (actualIn.getTime() - scheduled.getTime()) / 60000;

  console.log('[calculateMinutesLate] Debug:', {
    attendanceDateStr,
    shiftStartTime,
    gracePeriodMinutes,
    scheduledLocal: scheduled.toString(),
    firstInISO: actualIn.toISOString(),
    firstInLocal: actualIn.toString(),
    diffMinutes,
  });

  // 4) late only if after shift start + grace
  return diffMinutes > gracePeriodMinutes ? Math.round(diffMinutes) : 0;
}

// ============================================================================
// USER STORY 13 — ATTENDANCE CORRECTION REQUESTS
// BR-TM-15: Employees must be able to submit correction requests (reason + time),
//           sent to Line Manager for approval.
// ============================================================================
// 1. CREATE A CORRECTION REQUEST (Employee action)
// ============================================================================
// ============================================================================
// 1. CREATE A CORRECTION REQUEST (Employee action)
// ============================================================================
// ============================================================================
// 1. CREATE A CORRECTION REQUEST (Employee action)
// ============================================================================

async submitAttendanceCorrectionRequest(dto: {
  employeeId: Types.ObjectId;
  attendanceRecordId: Types.ObjectId;
  reason: string;
}) {
  // 1) Load attendance record
  const record = await this.attendanceRecordModel.findById(
    dto.attendanceRecordId,
  );
  if (!record) {
    throw new NotFoundException('Attendance record not found.');
  }

  // 2) Prevent duplicate OPEN/SUBMITTED requests for same record
  const exists = await this.attendanceCorrectionRequestModel.findOne({
    employeeId: dto.employeeId,
    attendanceRecord: dto.attendanceRecordId,
    status: {
      $in: [
        CorrectionRequestStatus.SUBMITTED,
        CorrectionRequestStatus.IN_REVIEW,
        CorrectionRequestStatus.ESCALATED,
      ],
    },
  });

  if (exists) {
    throw new BadRequestException(
      'A correction request for this attendance record is already pending.',
    );
  }

  // 3) Mark record as not finalised for payroll while any exception is open
  record.finalisedForPayroll = false;
  await record.save();

  // 4) Create the main correction request (high-level tracking)
  const request = new this.attendanceCorrectionRequestModel({
    employeeId: dto.employeeId,
    attendanceRecord: dto.attendanceRecordId,
    reason: dto.reason,
    status: CorrectionRequestStatus.SUBMITTED,
  });
  await request.save();

  // 5) Create TimeException(s) for all supervisors of this employee
  const supervisors = await this.getSupervisorsForEmployee(dto.employeeId);

  if (!supervisors || supervisors.length === 0) {
    await this.notificationLogModel.create({
      to: dto.employeeId,
      type: 'CORRECTION_REQUEST_SUBMITTED',
      message:
        'Your attendance correction request was submitted, but no supervisor was found. HR will review it.',
    });
    return request;
  }

  const exceptionsToInsert = supervisors.map((sup) => ({
    employeeId: dto.employeeId,
    type: TimeExceptionType.MANUAL_ADJUSTMENT, // 👈 use your enum here
    attendanceRecordId: record._id,
    assignedTo: sup._id,
    status: TimeExceptionStatus.OPEN,
    reason: dto.reason,
  }));

  const createdExceptions = await this.timeExceptionModel.insertMany(
    exceptionsToInsert,
  );

  // Add them to the record.exceptionIds
  record.exceptionIds.push(
    ...createdExceptions.map((ex) => ex._id),
  );
  await record.save();

  // 6) Notify employee
  await this.notificationLogModel.create({
    to: dto.employeeId,
    type: 'CORRECTION_REQUEST_SUBMITTED',
    message: 'Your attendance correction request has been submitted.',
  });

  return request;
}
// ============================================================================
// 2. GET EMPLOYEE'S CORRECTION REQUESTS (tracking)
// ============================================================================

async getMyCorrectionRequests(employeeId: Types.ObjectId) {
  return this.attendanceCorrectionRequestModel
    .find({ employeeId })
    .populate('attendanceRecord');
}
// ============================================================================
// 3. MANAGER / HR — REVIEW REQUEST (approve or reject)
// ============================================================================

async reviewCorrectionRequest(
  requestId: Types.ObjectId,
  newStatus: CorrectionRequestStatus.APPROVED | CorrectionRequestStatus.REJECTED,
  reviewerId: Types.ObjectId,
) {
  const request = await this.attendanceCorrectionRequestModel.findById(requestId);
  if (!request) {
    throw new NotFoundException('Correction request not found.');
  }

  // Only allow moving from SUBMITTED / IN_REVIEW (and optionally ESCALATED)
  if (
    request.status !== CorrectionRequestStatus.SUBMITTED &&
    request.status !== CorrectionRequestStatus.IN_REVIEW &&
    request.status !== CorrectionRequestStatus.ESCALATED
  ) {
    throw new BadRequestException('Request cannot be updated in its current status.');
  }

  // Update correction request status + reviewer
  request.status = newStatus;
  (request as any).reviewerId = reviewerId;
  await request.save();
  

  // Map correction status to time exception status
  const exceptionNewStatus =
    newStatus === CorrectionRequestStatus.APPROVED
      ? TimeExceptionStatus.RESOLVED    // adjust if your enum uses a different name
      : TimeExceptionStatus.REJECTED;

  // Update all related TimeExceptions for this employee + attendance record
  await this.timeExceptionModel.updateMany(
    {
      employeeId: request.employeeId,
      attendanceRecordId: request.attendanceRecord,
    },
    { status: exceptionNewStatus },
  );

  // If there are no more OPEN exceptions for this attendance record,
  // mark it finalised again for payroll
  const openCount = await this.timeExceptionModel.countDocuments({
    attendanceRecordId: request.attendanceRecord,
    status: TimeExceptionStatus.OPEN,
  });

  if (openCount === 0) {
    await this.attendanceRecordModel.findByIdAndUpdate(request.attendanceRecord, {
      finalisedForPayroll: true,
    });
  }

  // Notify employee
  await this.notificationLogModel.create({
    to: request.employeeId,
    type: 'CORRECTION_REQUEST_DECISION',
    message: `Your correction request was ${newStatus.toLowerCase()}.`,
  });

  return request;
}
async submitAttendanceCorrectionRequestByDate(dto: {
  employeeId: Types.ObjectId;
  date: Date;
  reason: string;
}) {
  // Normalize to day boundaries (00:00 → 23:59:59.999)
  const dayStart = new Date(dto.date);
  if (isNaN(dayStart.getTime())) {
    throw new BadRequestException('Invalid date provided.');
  }
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);

  // 1) Find existing attendance record for that employee + day
  // NOTE: if your field isn't called "date", rename it here.
  let record = await this.attendanceRecordModel.findOne({
    employeeId: dto.employeeId,
    date: { $gte: dayStart, $lte: dayEnd },
  });

  // 2) If none exists → create a new one with zero punches
  if (!record) {
    record = await this.attendanceRecordModel.create({
      employeeId: dto.employeeId,
      date: dayStart,
      punches: [],
      totalWorkMinutes: 0,
      hasMissedPunch: true,
      exceptionIds: [],
      finalisedForPayroll: false, // will be set to false inside submitAttendanceCorrectionRequest
    });
  }

  // 3) Delegate to the existing flow that:
  //    - prevents duplicate requests
  //    - marks record.finalisedForPayroll = false
  //    - creates the AttendanceCorrectionRequest
  //    - creates TimeExceptions for supervisors
  return this.submitAttendanceCorrectionRequest({
    employeeId: dto.employeeId,
    attendanceRecordId: record._id,
    reason: dto.reason,
  });
}

// ============================================================================
// 4. AUTO-ESCALATION IF NOT REVIEWED (BR-TM-15)
// Called daily by cron (optional)
// ============================================================================

async autoEscalateStaleCorrectionRequests() {
  // Example: requests older than 3 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 3);

  const requests =
    await this.attendanceCorrectionRequestModel.find({
      status: CorrectionRequestStatus.SUBMITTED,
      createdAt: { $lte: cutoff },
    });

  for (const req of requests) {
    req.status = CorrectionRequestStatus.ESCALATED;
    await req.save();

    await this.notificationLogModel.create({
      to: req.employeeId,
      type: 'CORRECTION_REQUEST_ESCALATED',
      message:
        'Your attendance correction request was escalated due to inactivity.',
    });

    // (Optional) You could also update related TimeExceptions here,
    // e.g. set them to IN_PROGRESS or ESCALATED if your enum supports it.
  }
}

// ============================================================================
// Helper: get all supervisors for an employee via supervisorPositionId
// ============================================================================

private async getSupervisorsForEmployee(
  employeeId: Types.ObjectId,
) {
  // We assume EmployeeProfile has supervisorPositionId and positionId fields
  const employee = await this.employeeModel
    .findById(employeeId)
    .select('supervisorPositionId');

  if (!employee || !employee.supervisorPositionId) {
    return [];
  }

  // All employees whose positionId matches employee.supervisorPositionId
  return this.employeeModel.find({
    positionId: employee.supervisorPositionId,
  });
}


// ============================================================================
// USER STORY 14 — TIME EXCEPTION APPROVAL WORKFLOW
// BR-TM-01: Line Managers + HR approve/reject
// BR-TM-15: Correction requests must go through approval workflow
// BR-TM-20: Unreviewed requests must auto-escalate before payroll cutoff
// ============================================================================

// ============================================================================
// 1. GET ALL PENDING EXCEPTIONS FOR MANAGER / HR
// ============================================================================
async getPendingTimeExceptionsForReview(reviewerId: Types.ObjectId) {
  return this.timeExceptionModel
    .find({
      status: TimeExceptionStatus.PENDING,
      assignedTo: reviewerId,
    })
    .populate('attendanceRecordId');
}

// ============================================================================
// 2. REVIEW (APPROVE / REJECT) A TIME EXCEPTION
// ============================================================================
async reviewTimeException(
  exceptionId: Types.ObjectId,
  reviewerId: Types.ObjectId,
  newStatus: TimeExceptionStatus.APPROVED | TimeExceptionStatus.REJECTED,
  comment?: string,
) {
  const exception = await this.timeExceptionModel.findById(exceptionId);

  if (!exception) {
    throw new NotFoundException('Time exception not found.');
  }

  if (exception.assignedTo?.toString() !== reviewerId.toString()) {
    throw new BadRequestException('You are not allowed to review this exception.');
  }

  if (exception.status !== TimeExceptionStatus.PENDING &&
      exception.status !== TimeExceptionStatus.OPEN) {
    throw new BadRequestException('Exception cannot be updated in its current status.');
  }

  exception.status = newStatus;
  if (comment) exception.reason = comment;

  await exception.save();

  // Notify employee
  await this.notificationLogModel.create({
    to: exception.employeeId,
    type: 'TIME_EXCEPTION_DECISION',
    message: `Your time exception was ${newStatus.toLowerCase()}.`,
  });

  return exception;
}

// ============================================================================
// 3. GET PENDING CORRECTION REQUESTS FOR REVIEW
// ============================================================================
async getPendingCorrectionRequests() {
  return this.attendanceCorrectionRequestModel
    .find({
      status: {
        $in: [
          CorrectionRequestStatus.SUBMITTED,
          CorrectionRequestStatus.IN_REVIEW,
        ],
      },
    })
    .populate('attendanceRecord');
}

// ============================================================================
// 4. REVIEW (APPROVE / REJECT) A CORRECTION REQUEST
// ============================================================================
async reviewCorrectionRequestWorkflow(
  requestId: Types.ObjectId,
  reviewerId: Types.ObjectId,
  newStatus: CorrectionRequestStatus.APPROVED | CorrectionRequestStatus.REJECTED,
) {
  const request = await this.attendanceCorrectionRequestModel.findById(requestId);

  if (!request) throw new NotFoundException('Correction request not found.');

  if (
    request.status !== CorrectionRequestStatus.SUBMITTED &&
    request.status !== CorrectionRequestStatus.IN_REVIEW
  ) {
    throw new BadRequestException('This request has already been processed.');
  }

  request.status = newStatus;
  await request.save();

  // Notify employee
  await this.notificationLogModel.create({
    to: request.employeeId,
    type: 'CORRECTION_REQUEST_DECISION',
    message:` Your attendance correction request was ${newStatus.toLowerCase()}.`,
  });

  return request;
}

// ============================================================================
// 5. AUTO-ESCALATION OF UNRESOLVED TIME EXCEPTIONS
// BR-TM-20: Before payroll cutoff, escalate unresolved items
// ============================================================================
async autoEscalateUnresolvedExceptions() {
  // Example: escalate anything pending for more than 3 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 3);

  const items = await this.timeExceptionModel.find({
    status: { $in: [TimeExceptionStatus.OPEN, TimeExceptionStatus.PENDING] },
    createdAt: { $lte: cutoff },
  });

  for (const item of items) {
    item.status = TimeExceptionStatus.ESCALATED;
    await item.save();

    await this.notificationLogModel.create({
      to: item.employeeId,
      type: 'TIME_EXCEPTION_ESCALATED',
      message: 'Your time exception has been escalated due to inactivity.',
    });
  }
}

// ============================================================================
// 6. AUTO-ESCALATION OF UNRESOLVED CORRECTION REQUESTS
// BR-TM-20
// ============================================================================
async autoEscalateStaleCorrectionRequestsForPayroll() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 3);

  const requests = await this.attendanceCorrectionRequestModel.find({
    status: CorrectionRequestStatus.SUBMITTED,
    createdAt: { $lte: cutoff },
  });

  for (const req of requests) {
    req.status = CorrectionRequestStatus.ESCALATED;
    await req.save();

    await this.notificationLogModel.create({
      to: req.employeeId,
      type: 'CORRECTION_REQUEST_ESCALATED',
      message: 'Your correction request was escalated before payroll cutoff.',
    });
  }
}

// ============================================================================
// USER STORY 15 — PERMISSION VALIDATION RULES
// BR-TM-16: Permission rules must define allowed durations and limits
// BR-TM-18: Only approved permissions affect payroll
// ============================================================================

// ============================================================================
// 1. HELPER — Validate permission duration (BR-TM-16)
// ============================================================================
private validatePermissionDuration(
  minutes: number,
  maxMinutes: number,
  type: TimeExceptionType,
) {
  if (minutes <= 0) {
    throw new BadRequestException('Permission duration must be greater than zero.');
  }

  if (minutes > maxMinutes) {
    throw new BadRequestException(
      `Maximum allowed duration for ${type} is ${maxMinutes} minutes.`,
    );
  }
}
// time-management.service.ts
async getPendingPermissions() {
  return this.timeExceptionModel
    .find({
      status: { $in: ['PENDING', 'OPEN', 'ESCALATED'] },
    })
    .populate('employeeId', 'firstName lastName personalEmail workEmail')
    .populate('attendanceRecordId')
    .sort({ createdAt: -1 })
    .lean();
}


// ============================================================================
// 2. HELPER — Get max minutes for permission type
// ============================================================================
private getMaxMinutesForType(type: TimeExceptionType): number {
  const limits: Record<TimeExceptionType, number> = {
    [TimeExceptionType.MISSED_PUNCH]: 480, // Full day
    [TimeExceptionType.LATE]: 120, // 2 hours max late arrival
    [TimeExceptionType.EARLY_LEAVE]: 120, // 2 hours max early departure
    [TimeExceptionType.SHORT_TIME]: 240, // 4 hours max short time
    [TimeExceptionType.OVERTIME_REQUEST]: 300, // 5 hours max overtime
    [TimeExceptionType.MANUAL_ADJUSTMENT]: 480, // Full day for manual adjustments
  };
  
  return limits[type] || 480;
}

// ============================================================================
// 3. HELPER — Format date for error messages (timezone-safe)
// ============================================================================
private formatDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// ============================================================================
// 4. SUBMIT PERMISSION REQUEST BY DATE (Employee)
// Finds attendance record by date and delegates to submitPermissionRequest
// ============================================================================
async submitPermissionRequestByDate(dto: {
  employeeId: Types.ObjectId;
  date: Date | string;
  type: TimeExceptionType;
  minutesRequested: number;
  reason?: string;
}) {
  // ============================
  // Parse date and create UTC day boundaries
  // ============================
  let dateStr: string;
  
  if (typeof dto.date === 'string') {
    dateStr = dto.date.split('T')[0];
  } else {
    const year = dto.date.getUTCFullYear();
    const month = String(dto.date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dto.date.getUTCDate()).padStart(2, '0');
    dateStr = `${year}-${month}-${day}`;
  }
  
  const dayStartUTC = new Date(`${dateStr}T00:00:00.000Z`);
  const dayEndUTC = new Date(`${dateStr}T23:59:59.999Z`);
  
  if (isNaN(dayStartUTC.getTime())) {
    throw new BadRequestException('Invalid date provided.');
  }

  console.log('=== DETAILED DEBUG ===');
  console.log('Employee ID:', dto.employeeId);
  console.log('Employee ID type:', typeof dto.employeeId);
  console.log('Searching for date:', dateStr);
  console.log('UTC range:', dayStartUTC.toISOString(), 'to', dayEndUTC.toISOString());

  // Try to find ANY record for this employee first
  const anyRecord = await this.attendanceRecordModel.findOne({
    employeeId: dto.employeeId,
  });
  
  console.log('Any record for employee exists?', anyRecord ? 'YES' : 'NO');
  if (anyRecord) {
    console.log('Sample record ID:', anyRecord._id);
    console.log('Sample record employeeId:', anyRecord.employeeId);
    console.log('Sample punches:', anyRecord.punches?.map(p => p.time.toISOString()));
  }

  // Now try the actual query
  const record = await this.attendanceRecordModel.findOne({
    employeeId: dto.employeeId,
    'punches.time': {
      $gte: dayStartUTC,
      $lte: dayEndUTC,
    },
  });

  console.log('Found record with date filter:', record ? 'YES - ID: ' + record._id : 'NO');

  if (!record) {
    throw new BadRequestException(
      `No attendance record found for ${dateStr}. Permission requests can only be submitted for days with an existing attendance record.`,
    );
  }

  // Rest of your code...
  const maxMinutes = this.getMaxMinutesForType(dto.type);
  this.validatePermissionDuration(dto.minutesRequested, maxMinutes, dto.type);

  const existingRequest = await this.timeExceptionModel.findOne({
    employeeId: dto.employeeId,
    attendanceRecordId: record._id,
    type: dto.type,
    status: {
      $in: [
        TimeExceptionStatus.OPEN,
        TimeExceptionStatus.PENDING,
        TimeExceptionStatus.ESCALATED,
        TimeExceptionStatus.APPROVED,
      ],
    },
  });

  if (existingRequest) {
    throw new BadRequestException(
      `A ${dto.type} permission request already exists for this date with status: ${existingRequest.status}`,
    );
  }

  return this.submitPermissionRequest({
    employeeId: dto.employeeId,
    attendanceRecordId: record._id,
    type: dto.type,
    minutesRequested: dto.minutesRequested,
    reason: dto.reason,
  });
}

  // ============================
  // Delegate to existing logic
  // ============================
// Add this to your TimeManagementService
async getAllPermissions(filters: {
  status?: string[];
  type?: TimeExceptionType;
  employeeId?: Types.ObjectId;
}) {
  const query: any = {
    type: {
      $in: [
        TimeExceptionType.EARLY_LEAVE,
        TimeExceptionType.SHORT_TIME,
        TimeExceptionType.OVERTIME_REQUEST,
        TimeExceptionType.MANUAL_ADJUSTMENT,
        TimeExceptionType.LATE,
        TimeExceptionType.MISSED_PUNCH,
      ],
    },
  };

  if (filters.status && filters.status.length > 0) {
    query.status = { $in: filters.status };
  }

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.employeeId) {
    query.employeeId = filters.employeeId;
  }

  return this.timeExceptionModel
    .find(query)
    .populate('employeeId', 'firstName lastName personalEmail workEmail')
    .populate('attendanceRecordId')
    .sort({ createdAt: -1 });
}
// ============================================================================
// 5. SUBMIT PERMISSION REQUEST (Employee)
// Core logic for creating permission requests
// ============================================================================
async submitPermissionRequest(dto: {
  employeeId: Types.ObjectId;
  attendanceRecordId: Types.ObjectId;
  type: TimeExceptionType;
  minutesRequested: number;
  reason?: string;
}) {
  // HR policy limits (BR-TM-16)
  const maxAllowed = this.getMaxMinutesForType(dto.type);

  // Validate duration
  this.validatePermissionDuration(
    dto.minutesRequested,
    maxAllowed,
    dto.type,
  );

  // Validate attendance record
  const record = await this.attendanceRecordModel.findById(
    dto.attendanceRecordId,
  );
  if (!record) {
    throw new NotFoundException('Attendance record not found.');
  }

  // Prevent duplicate pending permissions
  const exists = await this.timeExceptionModel.findOne({
    employeeId: dto.employeeId,
    attendanceRecordId: dto.attendanceRecordId,
    type: dto.type,
    status: {
      $in: [
        TimeExceptionStatus.OPEN,
        TimeExceptionStatus.PENDING,
        TimeExceptionStatus.ESCALATED,
      ],
    },
  });

  if (exists) {
    throw new BadRequestException(
      'A similar permission request is already pending.',
    );
  }

  // ✅ Create permission WITH persisted minutesRequested
  const permission = await this.timeExceptionModel.create({
    employeeId: dto.employeeId,
    attendanceRecordId: dto.attendanceRecordId,
    type: dto.type,
    status: TimeExceptionStatus.PENDING,
    reason: dto.reason ?? '',
    assignedTo: dto.employeeId, // temporary until manager assignment
    minutesRequested: dto.minutesRequested, // 🔑 REQUIRED for payroll
  });

  // Notify employee
  await this.notificationLogModel.create({
    to: dto.employeeId,
    type: 'PERMISSION_SUBMITTED',
    message: `Your permission request for ${dto.type} has been submitted.`,
  });

  return permission;
}
 
// ============================================================================
// 6. FETCH EMPLOYEE PERMISSION REQUESTS (USER STORY 15)
// ============================================================================
async getMyPermissions(employeeId: Types.ObjectId) {
  return this.timeExceptionModel
    .find({
      employeeId,
      type: {
        $in: [
          TimeExceptionType.EARLY_LEAVE,
          TimeExceptionType.SHORT_TIME,
          TimeExceptionType.OVERTIME_REQUEST,
          TimeExceptionType.MANUAL_ADJUSTMENT,
        ],
      },
    })
    .sort({ createdAt: -1 });
}

// ============================================================================
// 7. MANAGER / HR — APPROVE OR REJECT PERMISSION (BR-TM-18)
// ============================================================================
async reviewPermissionRequest(
  exceptionId: Types.ObjectId,
  reviewerId: Types.ObjectId,
  newStatus: TimeExceptionStatus.APPROVED | TimeExceptionStatus.REJECTED,
  comment?: string,
) {
  const exception = await this.timeExceptionModel.findById(exceptionId);

  if (!exception) {
    throw new NotFoundException('Permission request not found.');
  }

  if (
    exception.status !== TimeExceptionStatus.PENDING &&
    exception.status !== TimeExceptionStatus.OPEN &&
    exception.status !== TimeExceptionStatus.ESCALATED
  ) {
    throw new BadRequestException('This permission is no longer editable.');
  }

  // Update request
  exception.status = newStatus;
  if (comment) exception.reason = comment;
  await exception.save();

  // Notify employee
  await this.notificationLogModel.create({
    to: exception.employeeId,
    type: 'PERMISSION_DECISION',
    message: `Your permission request was ${newStatus.toLowerCase()}.`,
  });

  return exception;
}

// ============================================================================
// 8. ONLY APPROVED PERMISSIONS AFFECT PAYROLL (BR-TM-18)
// ============================================================================
async getApprovedPermissionsForPayroll(
  employeeId: Types.ObjectId,
  dateRange: { start: Date; end: Date },
) {
  return this.timeExceptionModel.find({
    employeeId,
    status: TimeExceptionStatus.APPROVED,
    type: {
      $in: [
        TimeExceptionType.EARLY_LEAVE,
        TimeExceptionType.SHORT_TIME,
        TimeExceptionType.OVERTIME_REQUEST,
      ],
    },
    createdAt: { $gte: dateRange.start, $lte: dateRange.end },
  });
}

// ============================================================================
// 9. AUTO-ESCALATION OF UNREVIEWED PERMISSIONS (BR-TM-20)
// ============================================================================
async autoEscalatePendingPermissions() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 3);

  const pending = await this.timeExceptionModel.find({
    status: TimeExceptionStatus.PENDING,
    createdAt: { $lte: cutoff },
  });

  for (const req of pending) {
    req.status = TimeExceptionStatus.ESCALATED;
    await req.save();

    await this.notificationLogModel.create({
      to: req.employeeId,
      type: 'PERMISSION_ESCALATED',
      message: `Your permission request has been escalated due to delay.`,
  });
  }

  return {
    escalated: pending.length,
    message: `${pending.length} permission request(s) escalated.`,
  };
}
// ============================================================================
// USER STORY 16 — VACATION PACKAGE INTEGRATION
// BR-TM-19: Time off automatically reflected in attendance
// ============================================================================

/**
 * US16 — Sync holidays from Leaves calendar and create attendance records
 */
async syncHolidaysFromLeavesCalendar(year: number) {
  try {
    // 1. Fetch calendar from Leaves module
    const leavesCalendar = await this.getCalendarByYear(year);

    if (!leavesCalendar || !leavesCalendar.holidays) {
      throw new BadRequestException('No holidays found in Leaves calendar');
    }

    const holidayDates = this.extractHolidayDates(leavesCalendar.holidays);
    
    let totalRecordsCreated = 0;
    const affectedEmployees = new Set<string>();

    // 2. Process each holiday date
    for (const holidayDate of holidayDates) {
      const result = await this.createAttendanceRecordsForHoliday(holidayDate);
      totalRecordsCreated += result.recordsCreated;
      result.employeeIds.forEach(id => affectedEmployees.add(id.toString()));
    }

    return {
      success: true,
      message: `Holiday sync completed for ${year}`,
      year,
      totalHolidayDates: holidayDates.length,
      totalRecordsCreated,
      affectedEmployeesCount: affectedEmployees.size,
    };
  } catch (error) {
    console.error('Failed to sync holidays from Leaves calendar:', error);
    throw error;
  }
}

/**
 * US16 — Preview which employees will be affected by holiday sync
 */
/**
 * US16 — Preview which employees will be affected by holiday sync
 */
async previewHolidaySync(year: number) {
  try {
    const leavesCalendar = await this.getCalendarByYear(year);

    if (!leavesCalendar || !leavesCalendar.holidays) {
      throw new BadRequestException('No holidays found in Leaves calendar');
    }

    const holidayDates = this.extractHolidayDates(leavesCalendar.holidays);
    const preview: Array<{
      date: string;
      affectedEmployees: Array<{
        employeeId: any;
        employeeName: string;
        employeeEmail: any;
        shiftName: any;
        shiftTime: string;
      }>;
    }> = []; // ← Fixed: Explicitly typed array

    for (const holidayDate of holidayDates) {
      const dayStart = new Date(holidayDate);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(holidayDate);
      dayEnd.setHours(23, 59, 59, 999);

      // Find shift assignments for this date
      const assignments = await this.shiftAssignmentModel
        .find({
          startDate: { $lte: dayEnd },
          $or: [
            { endDate: { $gte: dayStart } },
            { endDate: null },
          ],
          status: ShiftAssignmentStatus.APPROVED,
          employeeId: { $exists: true, $ne: null },
        })
        .populate('employeeId', 'firstName lastName personalEmail')
        .populate('shiftId', 'name startTime endTime')
        .lean();

      if (assignments.length > 0) {
        preview.push({
          date: holidayDate.toISOString().split('T')[0],
          affectedEmployees: assignments.map(a => ({
            employeeId: (a.employeeId as any)?._id,
            employeeName: `${(a.employeeId as any)?.firstName} ${(a.employeeId as any)?.lastName}`,
            employeeEmail: (a.employeeId as any)?.personalEmail,
            shiftName: (a.shiftId as any)?.name,
            shiftTime: `${(a.shiftId as any)?.startTime} - ${(a.shiftId as any)?.endTime}`,
          })),
        });
      }
    }

    return {
      year,
      totalHolidayDates: holidayDates.length,
      preview,
      totalAffectedEmployees: preview.reduce((sum, p) => sum + p.affectedEmployees.length, 0),
    };
  } catch (error) {
    console.error('Failed to preview holiday sync:', error);
    throw error;
  }
}
/**
 * US16 — Fetch Leaves calendar from Leaves module
 */

async getCalendarByYear(year: number) {
    const calendar = await this.calendarModel
      .findOne({ year })
      .populate('holidays')
      .exec();

    if (!calendar) {
      throw new NotFoundException(`Calendar for year ${year} not found`);
    }

    return calendar;
  }
/**
 * US16 — Extract all dates from holidays (handle multi-day holidays)
 */
private extractHolidayDates(holidays: any[]): Date[] {
  const dates: Date[] = [];

  for (const holiday of holidays) {
    if (!holiday.active) continue;

    const startDate = new Date(holiday.startDate);
    const endDate = holiday.endDate ? new Date(holiday.endDate) : startDate;

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return dates;
}

/**
 * US16 — Create attendance records for all employees with shifts on a holiday
 */
private async createAttendanceRecordsForHoliday(holidayDate: Date) {
  const dayStart = new Date(holidayDate);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(holidayDate);
  dayEnd.setHours(23, 59, 59, 999);

  const assignments = await this.shiftAssignmentModel
    .find({
      startDate: { $lte: dayEnd },
      $or: [{ endDate: { $gte: dayStart } }, { endDate: null }],
      status: ShiftAssignmentStatus.APPROVED,
      employeeId: { $exists: true, $ne: null },
    })
    .populate('shiftId')
    .lean();

  let recordsCreated = 0;
  const employeeIds: Types.ObjectId[] = [];

  for (const assignment of assignments) {
    if (!assignment.employeeId || !assignment.shiftId) continue;

    const shift = assignment.shiftId as any;

    // ⏱ Build shift start & end datetime
    const [startH, startM] = shift.startTime.split(':').map(Number);
    const [endH, endM] = shift.endTime.split(':').map(Number);

    const punchInTime = new Date(holidayDate);
    punchInTime.setHours(startH, startM, 0, 0);

    const punchOutTime = new Date(holidayDate);
    punchOutTime.setHours(endH, endM, 0, 0);

    const totalWorkMinutes =
      (punchOutTime.getTime() - punchInTime.getTime()) / (1000 * 60);

   const punches: Punch[] = [
  { type: PunchType.IN, time: punchInTime },
  { type: PunchType.OUT, time: punchOutTime },
];


    const existingRecord = await this.attendanceRecordModel.findOne({
      employeeId: assignment.employeeId,
      'punches.time': { $gte: dayStart, $lte: dayEnd },
    });

    if (existingRecord) {
      existingRecord.punches = punches;
      existingRecord.totalWorkMinutes = totalWorkMinutes;
      existingRecord.hasMissedPunch = false;
      existingRecord.finalisedForPayroll = true;
      await existingRecord.save();
    } else {
      await this.attendanceRecordModel.create({
        employeeId: assignment.employeeId,
        punches,
        totalWorkMinutes,
        hasMissedPunch: false,
        finalisedForPayroll: true,
      });
      recordsCreated++;
    }

    employeeIds.push(assignment.employeeId);

    await this.notificationLogModel.create({
      to: assignment.employeeId,
      type: 'HOLIDAY_APPLIED',
      message: `Holiday applied on ${holidayDate.toDateString()}. Attendance marked as fully paid.`,
    });
  }

  return { recordsCreated, employeeIds };
}

// ============================================================================
// USER STORY 17 — HOLIDAY & REST DAY CONFIGURATION
// BR-TM-19: No shifts or penalties should apply during holiday or rest days
// ============================================================================

// ============================================================================
// 1. CREATE HOLIDAY (Admin config)
// ============================================================================
async createHoliday(dto: {
  type: HolidayType;
  startDate: Date;
  endDate?: Date;
  name?: string;
}) {
  const holiday = new this.holidayModel(dto);
  return holiday.save();
}

// ============================================================================
// 2. GET ALL HOLIDAYS (with filters)
// ============================================================================
async getAllHolidays(filters?: {
  type?: string;
  year?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  const query: any = { active: true };

  if (filters?.type) {
    query.type = filters.type;
  }

  if (filters?.year) {
    const yearStart = new Date(filters.year, 0, 1);
    const yearEnd = new Date(filters.year, 11, 31, 23, 59, 59);
    query.startDate = { $gte: yearStart, $lte: yearEnd };
  }

  if (filters?.startDate || filters?.endDate) {
    query.startDate = {};
    if (filters.startDate) {
      query.startDate.$gte = filters.startDate;
    }
    if (filters.endDate) {
      query.startDate.$lte = filters.endDate;
    }
  }

  return this.holidayModel
    .find(query)
    .sort({ startDate: 1 })
    .lean();
}

// ============================================================================
// 3. GET SINGLE HOLIDAY BY ID
// ============================================================================
async getHolidayById(holidayId: Types.ObjectId) {
  const holiday = await this.holidayModel.findById(holidayId);
  
  if (!holiday) {
    throw new NotFoundException('Holiday not found');
  }

  return holiday;
}

// ============================================================================
// 4. UPDATE HOLIDAY
// ============================================================================
async updateHoliday(
  holidayId: Types.ObjectId,
  dto: {
    type?: HolidayType;
    startDate?: Date;
    endDate?: Date;
    name?: string;
  },
) {
  const holiday = await this.holidayModel.findById(holidayId);

  if (!holiday) {
    throw new NotFoundException('Holiday not found');
  }

  if (dto.type !== undefined) holiday.type = dto.type;
  if (dto.startDate !== undefined) holiday.startDate = dto.startDate;
  if (dto.endDate !== undefined) holiday.endDate = dto.endDate;
  if (dto.name !== undefined) holiday.name = dto.name;

  await holiday.save();

  return {
    success: true,
    message: 'Holiday updated successfully',
    holiday,
  };
}

// ============================================================================
// 5. DELETE HOLIDAY (soft delete by setting active = false)
// ============================================================================
async deleteHoliday(holidayId: Types.ObjectId) {
  const holiday = await this.holidayModel.findById(holidayId);

  if (!holiday) {
    throw new NotFoundException('Holiday not found');
  }

  // Soft delete
  holiday.active = false;
  await holiday.save();

  return {
    success: true,
    message: 'Holiday deleted successfully',
  };
}

// ============================================================================
// 6. GET UPCOMING HOLIDAYS
// ============================================================================
async getUpcomingHolidays(days: number = 30) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);

  return this.holidayModel
    .find({
      active: true,
      startDate: { $gte: today, $lte: futureDate },
    })
    .sort({ startDate: 1 })
    .lean();
}

// ============================================================================
// 7. CHECK IF SPECIFIC DATE IS A HOLIDAY
// ============================================================================
async checkIfHoliday(date: Date) {
  const holidays = await this.getHolidaysForDate(date);
  
  return {
    isHoliday: holidays.length > 0,
    holidays: holidays.map(h => ({
      id: h._id,
      name: h.name,
      type: h.type,
      startDate: h.startDate,
      endDate: h.endDate,
    })),
  };
}

// ============================================================================
// 8. FETCH ALL HOLIDAYS AFFECTING A SPECIFIC DATE (Helper)
// ============================================================================
private async getHolidaysForDate(date: Date) {
  return this.holidayModel.find({
    active: true,
    startDate: { $lte: date },
    $or: [{ endDate: { $gte: date } }, { endDate: null }],
  });
}
  // ============================================================================
// USER STORY 18 — ESCALATION BEFORE PAYROLL CUT-OFF
// BR-TM-20: Unreviewed requests must escalate before payroll finalization.
// ============================================================================



// ============================================================================
// 1. ESCALATE ATTENDANCE CORRECTION REQUESTS
// ============================================================================
private async escalateCorrectionRequests(cutoff: Date) {
  const pending = await this.correctionRequestModel.find({
    status: { $in: ['SUBMITTED', 'IN_REVIEW'] },
    // Remove createdAt filter to escalate ALL pending
    // createdAt: { $lte: cutoff },
  });

  console.log(`Found ${pending.length} correction requests to escalate`); // Debug log

  for (const req of pending) {
    req.status = CorrectionRequestStatus.ESCALATED;
    await req.save();

    await this.notificationLogModel.create({
      to: req.employeeId,
      type: 'REQUEST_ESCALATED',
      message: `Your attendance correction request was escalated due to payroll cut-off.`,
    });
  }

  return pending.length;
}

// ============================================================================
// 2. ESCALATE TIME EXCEPTIONS
// ============================================================================
private async escalateTimeExceptions(cutoff: Date) {
  const pending = await this.timeExceptionModel.find({
    status: { $in: ['OPEN', 'PENDING'] },
    // Remove createdAt filter to escalate ALL pending
    // createdAt: { $lte: cutoff },
  });

  console.log(`Found ${pending.length} time exceptions to escalate`); // Debug log

  for (const ex of pending) {
    ex.status = TimeExceptionStatus.ESCALATED;
    await ex.save();

    await this.notificationLogModel.create({
      to: ex.employeeId,
      type: 'EXCEPTION_ESCALATED',
      message: `Your time exception request was escalated due to payroll cut-off.`,
    });
  }

  return pending.length;
}

  // ============================================================================
  // 3. PUBLIC METHOD — FULL ESCALATION PROCESS
  // ----------------------------------------------------------------------------
  // Called automatically (cron) or by HR Admin
  // ============================================================================
  async escalatePendingRequestsBeforePayroll(cutoffDate: Date) {
    const corrections = await this.escalateCorrectionRequests(cutoffDate);
    const exceptions = await this.escalateTimeExceptions(cutoffDate);

    return {
      message: 'Escalation process completed before payroll cut-off.',
      correctionRequestsEscalated: corrections,
      timeExceptionsEscalated: exceptions,
    };
  }
  /**
 * US18 — Get pending requests that need escalation
 */
async getPendingEscalations(cutoffDate: Date) {
  const [corrections, exceptions] = await Promise.all([
    this.correctionRequestModel
      .find({
        status: { $in: [CorrectionRequestStatus.SUBMITTED, CorrectionRequestStatus.IN_REVIEW] },
        createdAt: { $lte: cutoffDate },
      })
      .populate('employeeId', 'firstName lastName personalEmail')
      .lean(),

    this.timeExceptionModel
      .find({
        status: { $in: [TimeExceptionStatus.OPEN, TimeExceptionStatus.PENDING] },
        createdAt: { $lte: cutoffDate },
      })
      .populate('employeeId', 'firstName lastName personalEmail')
      .lean(),
  ]);

  return {
    cutoffDate,
    pendingCorrections: corrections.length,
    pendingExceptions: exceptions.length,
    totalPending: corrections.length + exceptions.length,
    corrections,
    exceptions,
  };
}

/**
 * US18 — Get escalation history
 */

/**
 * US18 — Get escalation history
 */
async getEscalationHistory(filters: {
  startDate?: Date;
  endDate?: Date;
}) {
  const query: any = {};

  if (filters.startDate || filters.endDate) {
    query.updatedAt = {};
    if (filters.startDate) {
      query.updatedAt.$gte = filters.startDate;
    }
    if (filters.endDate) {
      query.updatedAt.$lte = filters.endDate;
    }
  }

  const [corrections, exceptions] = await Promise.all([
    this.correctionRequestModel
      .find({ ...query, status: CorrectionRequestStatus.ESCALATED })
      .populate('employeeId', 'firstName lastName personalEmail')
      .sort({ updatedAt: -1 })
      .lean(),

    this.timeExceptionModel
      .find({ ...query, status: TimeExceptionStatus.ESCALATED })
      .populate('employeeId', 'firstName lastName personalEmail')
      .sort({ updatedAt: -1 })
      .lean(),
  ]);

  return {
    totalEscalated: corrections.length + exceptions.length,
    corrections,
    exceptions,
  };
} // ← THIS WAS MISSING!
// ============================================================================
// USER STORY 19 — OVERTIME & EXCEPTION REPORTS (SIMPLE, PUNCH-BASED)
// ============================================================================

/**
 * Helper: get the latest OUT punch time from punches array.
 */
private getLastOutPunchTime(punches: Punch[] = []): Date | null {
  if (!punches || punches.length === 0) return null;

  const outPunches = punches.filter(
    (p: any) => p.type === PunchType.OUT || p.type === 'OUT',
  );
  if (!outPunches.length) return null;

  const latest = outPunches.reduce((acc, curr) => {
    const accTime = new Date(acc.time).getTime();
    const currTime = new Date(curr.time).getTime();
    return currTime > accTime ? curr : acc;
  });

  return new Date(latest.time);
}

/**
 * Helper: derive “attendance date” from punches.
 * We take the earliest punch and normalize it to that day (00:00).
 */
private getAttendanceDateFromPunches(punches: Punch[] = []): Date | null {
  if (!punches || punches.length === 0) return null;

  const sorted = [...punches].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  );
  const first = sorted[0];
  const d = new Date(first.time);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Helper: build scheduled shift end Date from shift.endTime ("HH:mm")
 * and an attendance date (the day we computed from punches).
 */
private buildShiftEndForAttendance(attendanceDate: Date, shift: any): Date | null {
  if (!shift || !shift.endTime) return null;

  const [hRaw, mRaw] = String(shift.endTime).split(':');
  const h = parseInt(hRaw, 10);
  const m = parseInt(mRaw, 10);

  if (Number.isNaN(h) || Number.isNaN(m)) return null;

  const scheduledEnd = new Date(attendanceDate);
  scheduledEnd.setHours(h || 0, m || 0, 0, 0);
  return scheduledEnd;
}

/**
 * Helper: export data array to CSV.
 */
private exportToCsv(data: any[], fileName: string) {
  const parser = new Json2CsvParser({ header: true });
  const csv = parser.parse(data);

  return {
    fileName,
    mimeType: 'text/csv',
    content: csv,
  };
}

/**
 * OVERTIME REPORT (based only on punches + shift end time)
 *
 * Logic:
 *  - Filter attendance records where punches.time is in [start, end]
 *  - For each record:
 *      * derive attendanceDate from first punch
 *      * find a shift assignment covering that date
 *      * build scheduledEnd from shift.endTime and attendanceDate
 *      * get last OUT punch
 *      * overtimeMinutes = differenceInMinutes(lastOut, scheduledEnd) if > 0
 */
async generateOvertimeReport(params: {
  startDate: string;
  endDate: string;
  employeeId?: string;
  exportCsv?: boolean;
}) {
  const { startDate, endDate, employeeId, exportCsv } = params;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new BadRequestException('Invalid startDate or endDate.');
  }
  if (start > end) {
    throw new BadRequestException('startDate cannot be after endDate.');
  }

  const recordQuery: any = {
    'punches.time': { $gte: start, $lte: end },
  };

  if (employeeId) {
    recordQuery.employeeId = new Types.ObjectId(employeeId);
  }

  const records = await this.attendanceRecordModel
    .find(recordQuery)
    .populate({
      path: 'employeeId',
      select: 'firstName lastName personalEmail',
    })
    .lean();

  const rows: any[] = [];
  let totalOvertimeMinutes = 0;

  for (const rec of records) {
    const punches = (rec as any).punches || [];
    const employee = rec.employeeId as any;

    const attendanceDate = this.getAttendanceDateFromPunches(punches);
    if (!attendanceDate) continue;

    const assignment = await this.shiftAssignmentModel
      .findOne({
        employeeId: employee._id,
        startDate: { $lte: attendanceDate },
        $or: [{ endDate: null }, { endDate: { $gte: attendanceDate } }],
      })
      .populate('shiftId')
      .lean();

    if (!assignment || !assignment.shiftId) continue;

    const shift = assignment.shiftId as any;
    const scheduledEnd = this.buildShiftEndForAttendance(attendanceDate, shift);
    if (!scheduledEnd) continue;

    const lastOut = this.getLastOutPunchTime(punches);
    if (!lastOut) continue;

    const diffMinutes = differenceInMinutes(lastOut, scheduledEnd);

    // Only positive → overtime
    if (diffMinutes <= 0) continue;

    const overtimeHours = Number((diffMinutes / 60).toFixed(2));
    totalOvertimeMinutes += diffMinutes;

    rows.push({
      date: attendanceDate.toISOString().split('T')[0],
      employeeId: String(employee._id),
      employeeName: `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim(),
      employeeEmail: employee.personalEmail || '',
      shiftName: shift.name || '',
      scheduledEnd: scheduledEnd.toISOString(),
      lastOut: lastOut.toISOString(),
      overtimeMinutes: diffMinutes,
      overtimeHours,
    });
  }

  const result = {
    summary: {
      totalRecordsWithOvertime: rows.length,
      totalOvertimeMinutes,
      totalOvertimeHours: Number((totalOvertimeMinutes / 60).toFixed(2)),
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    },
    rows,
  };

  if (!exportCsv) {
    return result;
  }

  return {
    ...result,
    ...this.exportToCsv(rows, 'overtime-report.csv'),
  };
}

/**
 * EXCEPTION REPORT (unchanged logic, just simple)
 * Reads directly from TimeException collection.
 */
// ============================================================================
// USER STORY 19 — EXCEPTION REPORT (FIXED & SIMPLE)
// ============================================================================
// ================================================
// USER STORY 19 — EXCEPTION REPORT (Notification Logs)
// ================================================
async generateExceptionReport(
  _range?: { start?: Date; end?: Date }, // kept for signature compatibility but unused
  exportCsv = false,
  employeeId?: string,
) {
  const query: any = {
    // Only include Time Management–related notification types
    type: { $in: this.timeManagementNotificationTypes },
  };

  // Optional filter by employee
  if (employeeId) {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employeeId filter');
    }
    query.to = new Types.ObjectId(employeeId);
  }

  const logs = await this.notificationLogModel
    .find(query)
    .sort({ createdAt: 1 }) // sort is fine; we don't *read* createdAt
    .lean()
    .exec();

  const rows = logs.map((log: any) => ({
    to: log.to?.toString?.() ?? '',
    title: log.type,          // "type" used as Title
    message: log.message ?? '',
  }));

  if (exportCsv) {
    // Simple static filename; no createdAt usage
    return this.exportToCsv(rows, 'exception-report.csv');
  }

  return {
    count: rows.length,
    rows,
  };
}

  // ============================================================================
// USER STORY 20 — CROSS-MODULE DATA SYNCHRONIZATION
// BR-TM-22: Sync daily with Payroll & Leaves modules
// ============================================================================



  // ========================================================================
  // 1. FETCH ATTENDANCE DATA FOR SYNC
  // ========================================================================
  private async fetchAttendanceForSync(range: { start: Date; end: Date }) {
    return this.attendanceRecordModel
      .find({
        'punches.time': {
          $gte: range.start,
          $lte: range.end,
        },
      })
      .populate('employeeId')
      .lean();
  }

  // ========================================================================
  // 2. FETCH TIME EXCEPTIONS FOR SYNC
  // ========================================================================
  private async fetchTimeExceptionsForSync(range: { start: Date; end: Date }) {
    return this.timeExceptionModel
      .find({
        createdAt: {
          $gte: range.start,
          $lte: range.end,
        },
      })
      .populate('employeeId')
      .lean();
  }

  // ========================================================================
  // 3. FETCH CORRECTION REQUESTS FOR SYNC
  // ========================================================================
  private async fetchCorrectionRequestsForSync(range: { start: Date; end: Date }) {
    return this.correctionRequestModel
      .find({
        createdAt: {
          $gte: range.start,
          $lte: range.end,
        },
      })
      .populate('employeeId')
      .lean();
  }

  // ========================================================================
  // 4. BUILD SYNC PAYLOAD
  //    (Standardized object sent to Payroll & Leaves modules)
  // ========================================================================
  private buildSyncPayload(attendance, exceptions, corrections) {
    return {
      timestamp: new Date(),
      attendance: attendance.map((rec) => ({
        employeeId: (rec.employeeId as any)?._id,
        employeeName: (rec.employeeId as any)?.fullName,
        totalWorkMinutes: rec.totalWorkMinutes,
        hasMissedPunch: rec.hasMissedPunch,
        punches: rec.punches,
      })),

      timeExceptions: exceptions.map((ex) => ({
        employeeId: (ex.employeeId as any)?._id,
        type: ex.type,
        status: ex.status,
        reason: ex.reason,
        createdAt: ex.createdAt,
      })),

      correctionRequests: corrections.map((r) => ({
        employeeId: (r.employeeId as any)?._id,
        status: r.status,
        reason: r.reason,
        createdAt: r.createdAt,
      })),
    };
  }

  // ========================================================================
  // 5. SEND SYNC DATA TO PAYROLL
  // ========================================================================
  private async syncToPayroll(payload: any) {
    try {
      await (this.payrollTrackingService as any).applyAttendanceSync(payload);
    } catch (err) {
      throw new BadRequestException('Failed to sync with Payroll module.');
    }
  }

  // ========================================================================
  // 6. SEND SYNC DATA TO LEAVES
  // ========================================================================
  private async syncToLeaves(payload: any) {
    try {
      await (this.leavesService as any).updateTimeManagementSync(payload);

    } catch (err) {
      throw new BadRequestException('Failed to sync with Leaves module.');
    }
  }
  /**
   
Provides a summary of attendance for an employee over a given period.
BR-TM-22: Support cross-module data integration (Performance).*/
async getEmployeeAttendanceSummary(
  employeeId: Types.ObjectId,
  startDate: Date,
  endDate: Date,): Promise<any> {
  const attendanceRecords = await this.attendanceRecordModel.find({
    employeeId: employeeId,'punches.time': { $gte: startDate, $lte: endDate },}).exec();

    const lateExceptions = await this.timeExceptionModel.countDocuments({
      employeeId,
      type: TimeExceptionType.LATE,
      status: { $in: [TimeExceptionStatus.APPROVED, TimeExceptionStatus.RESOLVED, TimeExceptionStatus.OPEN] },
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const missedPunchExceptions = await this.timeExceptionModel.countDocuments({
      employeeId,
      type: TimeExceptionType.MISSED_PUNCH,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    let totalWorkMinutes = 0;
    attendanceRecords.forEach(rec => {
      totalWorkMinutes += rec.totalWorkMinutes || 0;
    });

    return {
      daysPresent: attendanceRecords.length,
      lateArrivals: lateExceptions,
      missedPunches: missedPunchExceptions,
      totalWorkMinutes,
    };
  }

  // ========================================================================
  // 7. MAIN PUBLIC FUNCTION — FULL CROSS-MODULE SYNC
  //    Called by daily cron job or HR Manual Trigger
  // ========================================================================
  async syncCrossModuleData(range: { start: Date; end: Date }) {
    // Step 1 — Pull data
    const attendance = await this.fetchAttendanceForSync(range);
    const exceptions = await this.fetchTimeExceptionsForSync(range);
    const corrections = await this.fetchCorrectionRequestsForSync(range);

    // Step 2 — Build unified sync payload
    const payload = this.buildSyncPayload(attendance, exceptions, corrections);

    // Step 3 — Send to Payroll
    await this.syncToPayroll(payload);

    // Step 4 — Send to Leaves
    await this.syncToLeaves(payload);

    return {
      message: 'Cross-module synchronization completed successfully.',
      attendanceCount: attendance.length,
      exceptionCount: exceptions.length,
      correctionRequestCount: corrections.length,
    };
  }

}





