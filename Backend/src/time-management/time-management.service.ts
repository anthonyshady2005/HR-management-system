// NestJS Core
import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
// Mongoose
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Parser as Json2CsvParser } from 'json2csv';

// Schemas (Models)
import { AttendanceRecord, AttendanceRecordDocument } from './models/attendance-record.schema';
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


// Utilities
import { differenceInMinutes, isBefore, isAfter, parseISO } from 'date-fns';


@Injectable()
export class TimeManagementService {
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
    await this.ensureDepartmentExists(departmentId);

    const employees = await this.employeeModel.find({ departmentId });

    if (!employees.length) {
      throw new NotFoundException('No employees found in this department.');
    }

    const assignments = employees.map((emp) => ({
      ...dto,
      employeeId: emp._id,
      status: this.determineStatus(dto.startDate, dto.endDate),
    }));

    return this.shiftAssignmentModel.insertMany(assignments);
  }

  async assignShiftToPosition(positionId: Types.ObjectId, dto: ShiftAssignmentCreateDTO) {
    await this.ensurePositionExists(positionId);

    const employees = await this.employeeModel.find({ positionId });

    if (!employees.length) {
      throw new NotFoundException('No employees found in this position.');
    }

    const assignments = employees.map((emp) => ({
      ...dto,
      employeeId: emp._id,
      status: this.determineStatus(dto.startDate, dto.endDate),
    }));

    return this.shiftAssignmentModel.insertMany(assignments);
  }

  async updateShiftAssignment(id: string, dto: ShiftAssignmentUpdateDTO) {
    const assignment = await this.shiftAssignmentModel.findById(id);
    if (!assignment) throw new NotFoundException('Shift assignment not found.');

    Object.assign(assignment, dto);

    if (dto.startDate || dto.endDate) {
      assignment.status = this.determineStatus(
        dto.startDate ?? assignment.startDate,
        dto.endDate ?? assignment.endDate,
      );
    }

    return assignment.save();
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

  private determineStatus(start: Date, end?: Date): ShiftAssignmentStatus {
    const now = new Date();

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
    return this.shiftModel.find().populate('shiftType').sort({ name: 1 });
  }

  async updateShift(id: string, dto: any) {
    const shift = await this.shiftModel.findById(id);
    if (!shift) throw new NotFoundException('Shift not found.');

    if (dto.shiftType) {
      await this.ensureShiftTypeExists(dto.shiftType);
    }

    if (dto.startTime || dto.endTime) {
      this.ensureShiftTimesValid(
        dto.startTime ?? shift.startTime,
        dto.endTime ?? shift.endTime,
      );
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
   * - "4on-3off"
   * - "Mon,Tue,Thu"
   * - "Flex(08:00-10:00,16:00-18:00)"
   * - "Compressed(10h x 4d)"
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
// USER STORY 4 — SHIFT EXPIRY NOTIFICATIONS
// BR-TM-05
// ================================================

  /**
   * Notify HR/Admin when shift assignments are going to expire soon.
   * Default: notify 3 days before expiry.
   */
  async notifyUpcomingShiftExpiry(daysBefore: number = 3) {
    const now = new Date();

    const targetDate = new Date();
    targetDate.setDate(now.getDate() + daysBefore);

    // Find all assignments that:
    // - have an endDate within N days
    // - are not expired yet
    const expiringSoon = await this.shiftAssignmentModel.find({
      endDate: { $lte: targetDate, $gte: now },
      status: { $ne: 'EXPIRED' }
    }).populate('employeeId');

    if (!expiringSoon.length) return { message: 'No upcoming expirations.' };

    // Notify HR/Admin (we assume an "HR Admin" system user or role)
    const hrAdmins = await this.employeeModel.find({ role: 'HR_ADMIN' });

    if (!hrAdmins.length) return { message: 'No HR admins found.' };

    const notifications = [];

    for (const assignment of expiringSoon) {
      for (const admin of hrAdmins) {
       // notifications.push({
         // to: admin._id,
         // type: 'SHIFT_EXPIRY_WARNING',
         // message: `Shift for employee ${assignment.employeeId?.name ?? assignment.employeeId} expires on ${assignment.endDate}`
       // });
      }
    }

    await this.notificationLogModel.insertMany(notifications);

    return {
      notifiedAdmins: hrAdmins.length,
      records: expiringSoon.length,
    };
  }

  /**
   * This method can be used by a cron job.
   * It combines:
   * - notifying upcoming expiries
   * - auto-expiring old assignments
   */
  async handleShiftExpiryCron() {
    await this.notifyUpcomingShiftExpiry(3);
    await this.expireShiftAssignmentsAutomatically(); // from US-1
    return { message: 'Shift expiry cycle complete.' };
  }
  
  // ================================================
// USER STORY 5 — CLOCK-IN / CLOCK-OUT (EXCEL IMPORT)
// BR-TM-06
// ================================================

 

  /**
   * Handle a single row from the external Excel sheet.
   * - Finds employee by email
   * - Finds or creates today's AttendanceRecord
   * - Adds punch
   * - Recalculates totalWorkMinutes and hasMissedPunch
   */
  async logPunchFromExternalSheet(input: {
    employeeIdentifier: string;
    date: string;
    time: string;
    type: PunchType;
  }) {
    const employee = await this.employeeModel.findOne({ email: input.employeeIdentifier });

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

    this.recalculateAttendanceDerivedFields(attendance);

    await attendance.save();
    return attendance;
  }

  /**
   * Optional: real-time clock-in using employee email (or id).
   * This can be used by a web/mobile endpoint.
   */
  async clockIn(employeeIdentifier: string) {
    const employee = await this.employeeModel.findOne({ email: employeeIdentifier });

    if (!employee) {
      throw new NotFoundException(`Employee not found for identifier: ${employeeIdentifier}`);
    }

    const now = new Date();
    const attendance = await this.getOrCreateAttendanceRecordForDate(employee._id, now);

    attendance.punches.push({
      type: PunchType.IN,
      time: now,
    });

    this.recalculateAttendanceDerivedFields(attendance);
    await attendance.save();

    return attendance;
  }

  /**
   * Optional: real-time clock-out using employee email (or id).
   */
  async clockOut(employeeIdentifier: string) {
    const employee = await this.employeeModel.findOne({ email: employeeIdentifier });

    if (!employee) {
      throw new NotFoundException(`Employee not found for identifier: ${employeeIdentifier}`);
    }

    const now = new Date();
    const attendance = await this.getOrCreateAttendanceRecordForDate(employee._id, now);

    attendance.punches.push({
      type: PunchType.OUT,
      time: now,
    });

    this.recalculateAttendanceDerivedFields(attendance);
    await attendance.save();

    return attendance;
  }

// ================================================
// USER STORY 5 — INTERNAL HELPERS (FINAL VERSION)
// "Clock-In / Clock-Out from External Excel Data"
// BR-TM-06
// ================================================

/**
 * Combine date "YYYY-MM-DD" and time "HH:mm" into a Date object.
 */
private combineDateAndTime(dateStr: string, timeStr: string): Date {
  const iso = `${dateStr}T${timeStr}:00`;
  const d = new Date(iso);

  if (isNaN(d.getTime())) {
    throw new BadRequestException(
      `Invalid date/time combination: ${dateStr} ${timeStr}`
    );
  }

  return d;
}

/**
 * Get or create the AttendanceRecord for a given employee and day.
 */
private async getOrCreateAttendanceRecordForDate(
  employeeId: Types.ObjectId,
  date: Date
): Promise<AttendanceRecordDocument> {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  let record = await this.attendanceRecordModel.findOne({
    employeeId,
    'punches.time': { $gte: dayStart, $lte: dayEnd },
  });

  if (!record) {
    record = new this.attendanceRecordModel({
      employeeId,
      punches: [],
      totalWorkMinutes: 0,
      hasMissedPunch: false,
      exceptionIds: [],
      finalisedForPayroll: false,
    });
  }

  return record;
}

/**
 * Recalculate:
 * - totalWorkMinutes
 * - hasMissedPunch
 *
 * BR-TM-06: Maintain accurate punch pairing and detect missing records
 */
private recalculateAttendanceDerivedFields(record: AttendanceRecordDocument) {
  if (!record.punches || record.punches.length === 0) {
    record.totalWorkMinutes = 0;
    record.hasMissedPunch = false;
    return;
  }

  const punches = [...record.punches].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  let totalMinutes = 0;
  let expectingOut = false;
  let lastInTime: Date | null = null;
  let hasMissed = false;

  for (const punch of punches) {
    const punchTime = new Date(punch.time);

    if (punch.type === PunchType.IN) {
      if (expectingOut) hasMissed = true;
      lastInTime = punchTime;
      expectingOut = true;
    } else if (punch.type === PunchType.OUT) {
      if (!expectingOut || !lastInTime) {
        hasMissed = true;
        continue;
      }

      const diffMs = punchTime.getTime() - lastInTime.getTime();
      const diffMinutes = Math.max(0, Math.round(diffMs / 60000));
      totalMinutes += diffMinutes;

      expectingOut = false;
      lastInTime = null;
    }
  }

  if (expectingOut) hasMissed = true;

  record.totalWorkMinutes = totalMinutes;
  record.hasMissedPunch = hasMissed;
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
  async correctAttendance(input: {
    managerId: Types.ObjectId;
    employeeId: Types.ObjectId;
    date: string;          // YYYY-MM-DD
    newPunches: { type: PunchType; time: string }[]; // example: [{type: "IN", time:"08:55"}, {...}]
    reason: string;
  }) {

    // Convert date-only to real Date
    const dateStart = new Date(`${input.date}T00:00:00`);
    const dateEnd   = new Date(`${input.date}T23:59:59`);

    // Find or create attendance record
    let record = await this.attendanceRecordModel.findOne({
      employeeId: input.employeeId,
      'punches.time': { $gte: dateStart, $lte: dateEnd }
    });

    if (!record) {
      record = new this.attendanceRecordModel({
        employeeId: input.employeeId,
        punches: [],
        totalWorkMinutes: 0,
        hasMissedPunch: false,
        exceptionIds: [],
        finalisedForPayroll: false,
      });
    }

    // Replace punches with new ones from manager
    record.punches = input.newPunches.map((p) => ({
      type: p.type,
      time: new Date(`${input.date}T${p.time}:00`)
    }));

    // Recalculate total minutes + missed punches
    this.recalculateAttendanceDerivedFields(record);

    // Set finalisedForPayroll = false to prevent payroll issues
    record.finalisedForPayroll = false;

    await record.save();

    // Create an Attendance Correction Request (audit record)
    const audit = new this.correctionRequestModel({
      employeeId: input.employeeId,
      attendanceRecord: record._id,
      reason: input.reason,
      status: 'APPROVED', // Manager correction = auto approved
    });

    await audit.save();

    // Add notification for employee
    await this.notificationLogModel.create({
      to: input.employeeId,
      type: 'ATTENDANCE_CORRECTED',
      message: `Your attendance for ${input.date} was corrected by your manager.`,
    });

    // Add audit record for manager
    await this.notificationLogModel.create({
      to: input.managerId,
      type: 'ATTENDANCE_CORRECTION_LOG',
      message: `You corrected attendance for employee ${input.employeeId} on ${input.date}.`,
    });

    return {
      message: 'Attendance corrected successfully.',
      attendanceRecord: record,
      auditLog: audit,
    };
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

// ============================================================================
// USER STORY 8 — MISSED PUNCH MANAGEMENT (FINAL UPDATED VERSION)
// BR-TM-14
// ============================================================================



// ============================================================================
// 1. HELPER — Create TimeException for Missed Punch
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
    assignedTo: employeeId, // later replaced with actual line manager
  });

  await exception.save();
  return exception;
}

// ============================================================================
// 2. HELPER — Send Notifications for Missed Punch
// ============================================================================
private async notifyMissedPunch(
  employeeId: Types.ObjectId,
  message: string,
) {
  const notification = new this.notificationLogModel({
    to: employeeId,
    type: 'MISSED_PUNCH',
    message,
  });

  await notification.save();
}

// ============================================================================
// 3. CORE LOGIC — Process Missed Punch Exceptions
// (RENAMED from: handleMissedPunchIfNeeded)
// ============================================================================
private async processMissedPunchExceptions(
  attendance: AttendanceRecordDocument,
) {
  // No missed punch → No action
  if (!attendance.hasMissedPunch) return;

  // Check if an OPEN missed punch exception already exists for this record
  const existing = await this.timeExceptionModel.findOne({
    attendanceRecordId: attendance._id,
    type: TimeExceptionType.MISSED_PUNCH,
    status: TimeExceptionStatus.OPEN,
  });

  // Avoid creating duplicates
  if (existing) return;

  // Create new missed punch exception
  await this.createMissedPunchException(
    attendance.employeeId,
    attendance._id,
    'System detected missing punch(es) for this day.',
  );

  // Notify employee
  await this.notifyMissedPunch(
    attendance.employeeId,
    'You have a missing punch. Please submit a correction request.',
  );
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
// 1. HELPER — Calculate lateness using grace period
// ============================================================================
private calculateMinutesLate(
  punches: { type: string; time: Date }[],
  shiftStartTime: string,
  gracePeriod: number,
): number {
  const firstIn = punches
    .filter((p) => p.type === 'IN')
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())[0];

  if (!firstIn) return 0;

  const [hh, mm] = shiftStartTime.split(':').map(Number);

  const scheduled = new Date(firstIn.time);
  scheduled.setHours(hh, mm, 0, 0);

  const diffMinutes = Math.round(
    (new Date(firstIn.time).getTime() - scheduled.getTime()) / 60000,
  );

  return diffMinutes > gracePeriod ? diffMinutes : 0;
}

// ============================================================================
// 2. HELPER — Count lateness exceptions in last X days
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
// 3. CORE LOGIC — Repeated lateness escalation
// ============================================================================
async handleRepeatedLateness(
  attendance: AttendanceRecordDocument,
  shiftStartTime: string,
) {
  // Load lateness rule
  const rule = await this.latenessRuleModel.findOne({ active: true });
  if (!rule) return; // no lateness rules configured yet

  const minutesLate = this.calculateMinutesLate(
    attendance.punches,
    shiftStartTime,
    rule.gracePeriodMinutes,
  );

  // Not late → stop
  if (minutesLate <= 0) return;

  // Log lateness (as TimeException)
  await this.timeExceptionModel.create({
    employeeId: attendance.employeeId,
    attendanceRecordId: attendance._id,
    type: TimeExceptionType.LATE,
    status: TimeExceptionStatus.OPEN,
    reason:` Late by ${minutesLate} minutes.`,
    assignedTo: attendance.employeeId, // will be manager later
  });

  // Count lateness in last 30 days
  const incidents = await this.countLatenessExceptions(
    attendance.employeeId,
    30,
  );

  const threshold = 3; // configurable later

  if (incidents >= threshold) {
    // Escalation (BR-TM-16)
    await this.timeExceptionModel.create({
      employeeId: attendance.employeeId,
      attendanceRecordId: attendance._id,
      type: TimeExceptionType.LATE,
      status: TimeExceptionStatus.ESCALATED,
      reason:` Repeated lateness detected (${incidents} times in 30 days).`,
      assignedTo: attendance.employeeId,
    });

    // Notify HR/Manager
    await this.notificationLogModel.create({
      to: attendance.employeeId,
      type: 'REPEATED_LATENESS',
      message: `You have been late ${incidents} times. Your case has been escalated.`,
    });
  }
}
async getAttendanceRecordById(id: Types.ObjectId) {
  const record = await this.attendanceRecordModel.findById(id);

  if (!record) {
    throw new NotFoundException('Attendance record not found.');
  }

  return record;
}

// ============================================================================
// USER STORY 13 — ATTENDANCE CORRECTION REQUESTS
// BR-TM-15: Employees must be able to submit correction requests (reason + time),
//           sent to Line Manager for approval.
// ============================================================================
// 1. CREATE A CORRECTION REQUEST (Employee action)
// ============================================================================
async submitAttendanceCorrectionRequest(dto: {
  employeeId: Types.ObjectId;
  attendanceRecordId: Types.ObjectId;
  reason: string;
}) {
  // Validate attendance record exists
  const record = await this.attendanceRecordModel.findById(dto.attendanceRecordId);
  if (!record) {
    throw new NotFoundException('Attendance record not found.');
  }

  // Prevent duplicate OPEN/SUBMITTED requests for same record
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

  // Create new correction request
  const request = new this.attendanceCorrectionRequestModel({
    employeeId: dto.employeeId,
    attendanceRecord: dto.attendanceRecordId,
    reason: dto.reason,
    status: CorrectionRequestStatus.SUBMITTED,
  });

  await request.save();

  // Notify line manager (placeholder)
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
// 3. MANAGER — REVIEW REQUEST (approve or reject)
// ============================================================================
async reviewCorrectionRequest(
  requestId: Types.ObjectId,
  newStatus: CorrectionRequestStatus.APPROVED | CorrectionRequestStatus.REJECTED,
  reviewerId: Types.ObjectId,
) {
  const request = await this.attendanceCorrectionRequestModel.findById(requestId);
  if (!request) throw new NotFoundException('Correction request not found.');

  if (request.status !== CorrectionRequestStatus.SUBMITTED &&
      request.status !== CorrectionRequestStatus.IN_REVIEW) {
    throw new BadRequestException('Request cannot be updated in its current status.');
  }

  request.status = newStatus;
  await request.save();

  // Notify employee
  await this.notificationLogModel.create({
    to: request.employeeId,
    type: 'CORRECTION_REQUEST_DECISION',
    message: `Your correction request was ${newStatus.toLowerCase()}.`,
  });

  return request;
}

// ============================================================================
// 4. AUTO-ESCALATION IF NOT REVIEWED (BR-TM-15)
// Called daily by cron (optional)
// ============================================================================
async autoEscalateStaleCorrectionRequests() {
  // Example: requests older than 3 days
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
      message:
        'Your attendance correction request was escalated due to inactivity.',
    });
  }
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

// ============================================================================
// 2. SUBMIT PERMISSION REQUEST (Employee)
// ============================================================================
async submitPermissionRequest(dto: {
  employeeId: Types.ObjectId;
  attendanceRecordId: Types.ObjectId;
  type: TimeExceptionType;
  minutesRequested: number;
  reason?: string;
}) {
  // Limit rules (example: HR policies)
  const limits = {
    [TimeExceptionType.EARLY_LEAVE]: 120,       // max 2 hours
    [TimeExceptionType.SHORT_TIME]: 180,        // max 3 hours
    [TimeExceptionType.OVERTIME_REQUEST]: 300,  // max 5 hours
    [TimeExceptionType.MANUAL_ADJUSTMENT]: 60,
  };

  const maxAllowed = limits[dto.type] ?? 180;

  // BR-TM-16 — Verify duration limits
  this.validatePermissionDuration(dto.minutesRequested, maxAllowed, dto.type);

  // Validate attendance record exists
  const record = await this.attendanceRecordModel.findById(dto.attendanceRecordId);
  if (!record) {
    throw new NotFoundException('Attendance record not found.');
  }

  // Prevent duplicates (same day & type)
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

  // Create new permission request
  const permission = await this.timeExceptionModel.create({
    employeeId: dto.employeeId,
    attendanceRecordId: dto.attendanceRecordId,
    type: dto.type,
    status: TimeExceptionStatus.PENDING,
    reason: dto.reason ?? '',
    assignedTo: dto.employeeId, // temporarily employee → will change to manager
    minutesRequested: dto.minutesRequested, // NOT stored in DB (ignored but harmless)
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
// 3. MANAGER / HR — APPROVE OR REJECT PERMISSION (BR-TM-18)
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
    exception.status !== TimeExceptionStatus.OPEN
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
// 4. ONLY APPROVED PERMISSIONS AFFECT PAYROLL (BR-TM-18)
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
// 5. AUTO-ESCALATION OF UNREVIEWED PERMISSIONS (BR-TM-20)
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
}
// ============================================================================
// USER STORY 16 — VACATION PACKAGE INTEGRATION (DIRECT SERVICE CALL VERSION)
// BR-TM-19: Link leave/vacation days to attendance & shift schedules
// ============================================================================


  // 1. FETCH APPROVED LEAVES DIRECTLY FROM LEAVES MODULE
  // ============================================================================
  private async fetchApprovedLeaves(
    employeeId: Types.ObjectId,
    range: { start: Date; end: Date },
  ): Promise<Array<{ date: string }>> {

    try {
      // Query the LeaveRequest model for approved leaves in the provided range
      const leaves = await this.leaveRequestService
        .find({
          employeeId,
          status: 'APPROVED',
          date: { $gte: range.start, $lte: range.end },
        })
        .select('date')
        .lean();

      // Must return simplified structure: [{ date: "YYYY-MM-DD" }]
      return leaves.map((l: any) => {
        const d = l.date instanceof Date ? l.date : new Date(l.date);
        if (isNaN(d.getTime())) {
          // If date is not valid, return as-is string to avoid data loss
          return { date: String(l.date) };
        }
        return { date: d.toISOString().split('T')[0] };
      });
    } catch (err) {
      throw new BadRequestException('Failed to load approved leaves from Leaves subsystem.');
    }
  }

  // ============================================================================
  // 2. MARK ATTENDANCE AS LEAVE DAY (NO SCHEMA CHANGES)
  // ============================================================================
  private async applyLeaveToAttendance(
    employeeId: Types.ObjectId,
    leaveDays: Array<{ date: string }>,
  ) {
    for (const entry of leaveDays) {
      const leaveDate = new Date(entry.date);

      // Try to find existing attendance record
      let record = await this.attendanceRecordModel.findOne({
        employeeId,
        day: entry.date, // if you don't have day, I will adjust (just tell me)
      });

      if (!record) {
        record = new this.attendanceRecordModel({
          employeeId,
          punches: [],
          totalWorkMinutes: 0,
          hasMissedPunch: false,
          exceptionIds: [],
          finalisedForPayroll: true,
        });
      }

      // On leave day → no work, no penalties
      record.totalWorkMinutes = 0;
      record.hasMissedPunch = false;
      record.finalisedForPayroll = true;

      await record.save();
    }
  }

  // ============================================================================
  // 3. PUBLIC METHOD — FULL INTEGRATION EXECUTION
  // ============================================================================
  async integrateVacationPackages(
    employeeId: Types.ObjectId,
    range: { start: Date; end: Date },
  ) {
    // Step 1: Get approved leave days
    const leaveDays = await this.fetchApprovedLeaves(employeeId, range);

    if (leaveDays.length === 0) {
      return { message: 'No approved leaves for this employee in this range.' };
    }

    // Step 2: Apply to attendance
    await this.applyLeaveToAttendance(employeeId, leaveDays);

    // Step 3: Send notification
    await this.notificationLogModel.create({
      to: employeeId,
      type: 'LEAVE_INTEGRATION',
      message: `Your approved leave days were reflected in the attendance system.`,
    });

    return {
      message: `Integrated ${leaveDays.length} leave days successfully.`,
      leaveDays,
    };
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
  // 2. FETCH ALL HOLIDAYS AFFECTING A SPECIFIC DATE
  // ============================================================================
  private async getHolidaysForDate(date: Date) {
    return this.holidayModel.find({
      active: true,
      startDate: { $lte: date },
      $or: [{ endDate: { $gte: date } }, { endDate: null }],
    });
  }

  // ============================================================================
  // 3. DETERMINE IF A DATE IS HOLIDAY OR WEEKLY REST DAY
  // ============================================================================
  private async isHoliday(date: Date): Promise<boolean> {
    const list = await this.getHolidaysForDate(date);
    return list.length > 0;
  }

  // ============================================================================
  // 4. APPLY HOLIDAY RULES TO ATTENDANCE
  // ============================================================================
  private async applyHolidayRules(
    employeeId: Types.ObjectId,
    date: Date,
  ) {
    const isHoliday = await this.isHoliday(date);
    if (!isHoliday) return; // normal working day → no change

    let record = await this.attendanceRecordModel.findOne({
      employeeId,
      'punches.time': {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999)),
      },
    });

    if (!record) {
      // Create a clean attendance record for the holiday
      record = new this.attendanceRecordModel({
        employeeId,
        punches: [],
        totalWorkMinutes: 0,
        hasMissedPunch: false,
        finalisedForPayroll: true,
      });
    }

    // No penalties, no lateness, no missed punches
    record.totalWorkMinutes = 0;
    record.hasMissedPunch = false;
    record.finalisedForPayroll = true;

    await record.save();

    // Notify employee (optional)
    await this.notificationLogModel.create({
      to: employeeId,
      type: 'HOLIDAY_APPLIED',
      message: `Holiday rules applied for ${date.toDateString()}.`,
    });
  }

  // ============================================================================
  // 5. PUBLIC METHOD — APPLY HOLIDAY RULES FOR AN EMPLOYEE RANGE
  // ----------------------------------------------------------------------------
  // Called by:
  // - daily cron
  // - HR Admin
  // ============================================================================
  async applyHolidayRange(
    employeeId: Types.ObjectId,
    range: { start: Date; end: Date },
  ) {
    const days: Date[] = [];
    let current = new Date(range.start);

    while (current <= range.end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    for (const day of days) {
      await this.applyHolidayRules(employeeId, day);
    }

    return {
      message: 'Holiday & Rest Day rules applied successfully.',
      totalDays: days.length,
    };
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
      createdAt: { $lte: cutoff },
    });

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
      createdAt: { $lte: cutoff },
    });

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
// ============================================================================
// USER STORY 19 — OVERTIME & EXCEPTION REPORTS (FIXED TYPING)
// ============================================================================


  // ============================================================================
  // 1. OVERTIME REPORT
  // ============================================================================
  async getOvertimeReport(range: { start: Date; end: Date }) {
    const records = await this.attendanceRecordModel
      .find({
        'punches.time': {
          $gte: range.start,
          $lte: range.end,
        },
      })
      .populate('employeeId') // gets full employee object
      .lean();

    const report = records.map((rec) => {
      const emp = rec.employeeId as any; // FIX FOR TS ERROR

      return {
        employeeName: emp?.fullName || 'Unknown',
        employeeEmail: emp?.email || '',
        totalWorkMinutes: rec.totalWorkMinutes,
        hasMissedPunch: rec.hasMissedPunch,
        exceptionCount: rec.exceptionIds?.length || 0,
      };
    });

    return report;
  }

  // ============================================================================
  // 2. EXCEPTION REPORT
  // ============================================================================
  async getExceptionReport(range: { start: Date; end: Date }) {
    const exceptions = await this.timeExceptionModel
      .find({
        createdAt: {
          $gte: range.start,
          $lte: range.end,
        },
      })
      .populate('employeeId')
      .populate('attendanceRecordId')
      .lean();

    return exceptions.map((ex) => {
      const emp = ex.employeeId as any; // FIX FOR TS ERROR

      return {
        employeeName: emp?.fullName || '',
        employeeEmail: emp?.email || '',
        type: ex.type,
        status: ex.status,
        reason: ex.reason || '',
        attendanceRecordId: ex.attendanceRecordId?._id || '',
      };
    });
  }

  // ============================================================================
  // 3. EXPORT TO CSV
  // ============================================================================
  private exportToCsv(data: any[], fileName: string) {
    const parser = new Json2CsvParser({ header: true });
    const csv = parser.parse(data);

    return {
      fileName,
      mimeType: 'text/csv',
      content: csv,
    };
  }

  // ============================================================================
  // 4. PUBLIC — OVERTIME REPORT
  // ============================================================================
  async generateOvertimeReport(
    range: { start: Date; end: Date },
    exportAsCsv = false,
  ) {
    const report = await this.getOvertimeReport(range);
    if (!exportAsCsv) return report;

    return this.exportToCsv(report, 'overtime-report.csv');
  }

  // ============================================================================
  // 5. PUBLIC — EXCEPTION REPORT
  // ============================================================================
  async generateExceptionReport(
    range: { start: Date; end: Date },
    exportAsCsv = false,
  ) {
    const report = await this.getExceptionReport(range);
    if (!exportAsCsv) return report;

    return this.exportToCsv(report, 'exception-report.csv');
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





