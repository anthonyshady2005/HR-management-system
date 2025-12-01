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
exports.TimeManagementService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const json2csv_1 = require("json2csv");
const attendance_record_schema_1 = require("./models/attendance-record.schema");
const attendance_correction_request_schema_1 = require("./models/attendance-correction-request.schema");
const shift_schema_1 = require("./models/shift.schema");
const shift_assignment_schema_1 = require("./models/shift-assignment.schema");
const shift_type_schema_1 = require("./models/shift-type.schema");
const schedule_rule_schema_1 = require("./models/schedule-rule.schema");
const lateness_rule_schema_1 = require("./models/lateness-rule.schema");
const overtime_rule_schema_1 = require("./models/overtime-rule.schema");
const time_exception_schema_1 = require("./models/time-exception.schema");
const holiday_schema_1 = require("./models/holiday.schema");
const notification_log_schema_1 = require("./models/notification-log.schema");
const employee_profile_schema_1 = require("../employee-profile/models/employee-profile.schema");
const department_schema_1 = require("../organization-structure/models/department.schema");
const position_schema_1 = require("../organization-structure/models/position.schema");
const leave_request_schema_1 = require("../leaves/models/leave-request.schema");
const leaves_service_1 = require("../leaves/leaves.service");
const payroll_tracking_service_1 = require("../payroll-tracking/payroll-tracking.service");
const enums_1 = require("./models/enums");
let TimeManagementService = class TimeManagementService {
    shiftAssignmentModel;
    shiftModel;
    shiftTypeModel;
    scheduleRuleModel;
    employeeModel;
    departmentModel;
    positionModel;
    notificationLogModel;
    attendanceRecordModel;
    correctionRequestModel;
    timeExceptionModel;
    overtimeRuleModel;
    latenessRuleModel;
    attendanceCorrectionRequestModel;
    leaveRequestService;
    holidayModel;
    leavesService;
    payrollTrackingService;
    constructor(shiftAssignmentModel, shiftModel, shiftTypeModel, scheduleRuleModel, employeeModel, departmentModel, positionModel, notificationLogModel, attendanceRecordModel, correctionRequestModel, timeExceptionModel, overtimeRuleModel, latenessRuleModel, attendanceCorrectionRequestModel, leaveRequestService, holidayModel, leavesService, payrollTrackingService) {
        this.shiftAssignmentModel = shiftAssignmentModel;
        this.shiftModel = shiftModel;
        this.shiftTypeModel = shiftTypeModel;
        this.scheduleRuleModel = scheduleRuleModel;
        this.employeeModel = employeeModel;
        this.departmentModel = departmentModel;
        this.positionModel = positionModel;
        this.notificationLogModel = notificationLogModel;
        this.attendanceRecordModel = attendanceRecordModel;
        this.correctionRequestModel = correctionRequestModel;
        this.timeExceptionModel = timeExceptionModel;
        this.overtimeRuleModel = overtimeRuleModel;
        this.latenessRuleModel = latenessRuleModel;
        this.attendanceCorrectionRequestModel = attendanceCorrectionRequestModel;
        this.leaveRequestService = leaveRequestService;
        this.holidayModel = holidayModel;
        this.leavesService = leavesService;
        this.payrollTrackingService = payrollTrackingService;
    }
    async assignShiftToEmployee(dto) {
        await this.validateShiftAssignmentInput(dto);
        const assignment = new this.shiftAssignmentModel({
            ...dto,
            status: this.determineStatus(dto.startDate, dto.endDate),
        });
        return assignment.save();
    }
    async assignShiftToDepartment(departmentId, dto) {
        await this.ensureDepartmentExists(departmentId);
        const employees = await this.employeeModel.find({ departmentId });
        if (!employees.length) {
            throw new common_1.NotFoundException('No employees found in this department.');
        }
        const assignments = employees.map((emp) => ({
            ...dto,
            employeeId: emp._id,
            status: this.determineStatus(dto.startDate, dto.endDate),
        }));
        return this.shiftAssignmentModel.insertMany(assignments);
    }
    async assignShiftToPosition(positionId, dto) {
        await this.ensurePositionExists(positionId);
        const employees = await this.employeeModel.find({ positionId });
        if (!employees.length) {
            throw new common_1.NotFoundException('No employees found in this position.');
        }
        const assignments = employees.map((emp) => ({
            ...dto,
            employeeId: emp._id,
            status: this.determineStatus(dto.startDate, dto.endDate),
        }));
        return this.shiftAssignmentModel.insertMany(assignments);
    }
    async updateShiftAssignment(id, dto) {
        const assignment = await this.shiftAssignmentModel.findById(id);
        if (!assignment)
            throw new common_1.NotFoundException('Shift assignment not found.');
        Object.assign(assignment, dto);
        if (dto.startDate || dto.endDate) {
            assignment.status = this.determineStatus(dto.startDate ?? assignment.startDate, dto.endDate ?? assignment.endDate);
        }
        return assignment.save();
    }
    async expireShiftAssignmentsAutomatically() {
        const now = new Date();
        await this.shiftAssignmentModel.updateMany({
            endDate: { $lt: now },
            status: { $ne: enums_1.ShiftAssignmentStatus.EXPIRED },
        }, { status: enums_1.ShiftAssignmentStatus.EXPIRED });
    }
    async validateShiftAssignmentInput(dto) {
        await this.ensureShiftExists(dto.shiftId);
        if (dto.scheduleRuleId) {
            await this.ensureScheduleRuleExists(dto.scheduleRuleId);
        }
        if (dto.employeeId) {
            await this.ensureEmployeeExists(dto.employeeId);
        }
        if (dto.endDate && dto.startDate > dto.endDate) {
            throw new common_1.BadRequestException('startDate cannot be after endDate.');
        }
    }
    async ensureShiftExists(id) {
        const shift = await this.shiftModel.findById(id);
        if (!shift)
            throw new common_1.NotFoundException('Shift not found.');
    }
    async ensureScheduleRuleExists(id) {
        const rule = await this.scheduleRuleModel.findById(id);
        if (!rule)
            throw new common_1.NotFoundException('Schedule rule not found.');
    }
    async ensureEmployeeExists(id) {
        const emp = await this.employeeModel.findById(id);
        if (!emp)
            throw new common_1.NotFoundException('Employee not found.');
    }
    async ensureDepartmentExists(id) {
        const dept = await this.departmentModel.findById(id);
        if (!dept)
            throw new common_1.NotFoundException('Department not found.');
    }
    async ensurePositionExists(id) {
        const pos = await this.positionModel.findById(id);
        if (!pos)
            throw new common_1.NotFoundException('Position not found.');
    }
    determineStatus(start, end) {
        const now = new Date();
        if (end && end < now) {
            return enums_1.ShiftAssignmentStatus.EXPIRED;
        }
        if (start > now) {
            return enums_1.ShiftAssignmentStatus.PENDING;
        }
        return enums_1.ShiftAssignmentStatus.APPROVED;
    }
    async createShiftType(dto) {
        const exists = await this.shiftTypeModel.findOne({ name: dto.name });
        if (exists)
            throw new common_1.BadRequestException('Shift type already exists.');
        const type = new this.shiftTypeModel({
            name: dto.name,
            active: dto.active ?? true,
        });
        return type.save();
    }
    async getAllShiftTypes() {
        return this.shiftTypeModel.find().sort({ name: 1 });
    }
    async updateShiftType(id, dto) {
        const type = await this.shiftTypeModel.findById(id);
        if (!type)
            throw new common_1.NotFoundException('Shift type not found.');
        if (dto.name) {
            const conflict = await this.shiftTypeModel.findOne({
                name: dto.name,
                _id: { $ne: id }
            });
            if (conflict)
                throw new common_1.BadRequestException('Shift type name already in use.');
        }
        Object.assign(type, dto);
        return type.save();
    }
    async deactivateShiftType(id) {
        const type = await this.shiftTypeModel.findById(id);
        if (!type)
            throw new common_1.NotFoundException('Shift type not found.');
        type.active = false;
        return type.save();
    }
    async createShift(dto) {
        await this.ensureShiftTypeExists(dto.shiftType);
        this.ensureShiftTimesValid(dto.startTime, dto.endTime);
        const existing = await this.shiftModel.findOne({ name: dto.name });
        if (existing) {
            throw new common_1.BadRequestException('Shift name already exists.');
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
    async updateShift(id, dto) {
        const shift = await this.shiftModel.findById(id);
        if (!shift)
            throw new common_1.NotFoundException('Shift not found.');
        if (dto.shiftType) {
            await this.ensureShiftTypeExists(dto.shiftType);
        }
        if (dto.startTime || dto.endTime) {
            this.ensureShiftTimesValid(dto.startTime ?? shift.startTime, dto.endTime ?? shift.endTime);
        }
        Object.assign(shift, dto);
        return shift.save();
    }
    async deactivateShift(id) {
        const shift = await this.shiftModel.findById(id);
        if (!shift)
            throw new common_1.NotFoundException('Shift not found.');
        shift.active = false;
        return shift.save();
    }
    async ensureShiftTypeExists(id) {
        const type = await this.shiftTypeModel.findById(id);
        if (!type)
            throw new common_1.NotFoundException('Shift type not found.');
    }
    ensureShiftTimesValid(start, end) {
        const isValid = /^[0-2]\d:[0-5]\d$/.test(start) && /^[0-2]\d:[0-5]\d$/.test(end);
        if (!isValid) {
            throw new common_1.BadRequestException('Start/End time must be in HH:MM format.');
        }
        if (start === end) {
            throw new common_1.BadRequestException('Shift start and end time cannot be identical.');
        }
    }
    async createScheduleRule(dto) {
        const exists = await this.scheduleRuleModel.findOne({ name: dto.name });
        if (exists) {
            throw new common_1.BadRequestException('A scheduling rule with this name already exists.');
        }
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
    async updateScheduleRule(id, dto) {
        const rule = await this.scheduleRuleModel.findById(id);
        if (!rule)
            throw new common_1.NotFoundException('Schedule rule not found.');
        if (dto.name) {
            const conflict = await this.scheduleRuleModel.findOne({
                name: dto.name,
                _id: { $ne: id }
            });
            if (conflict) {
                throw new common_1.BadRequestException('A scheduling rule with this name already exists.');
            }
        }
        if (dto.pattern) {
            this.validateSchedulingPattern(dto.pattern);
        }
        Object.assign(rule, dto);
        return rule.save();
    }
    async deactivateScheduleRule(id) {
        const rule = await this.scheduleRuleModel.findById(id);
        if (!rule)
            throw new common_1.NotFoundException('Schedule rule not found.');
        rule.active = false;
        return rule.save();
    }
    validateSchedulingPattern(pattern) {
        if (!pattern || typeof pattern !== 'string') {
            throw new common_1.BadRequestException('Invalid schedule pattern format.');
        }
        const flexiblePattern = /^Flex\(\d{2}:\d{2}-\d{2}:\d{2},\d{2}:\d{2}-\d{2}:\d{2}\)$/;
        const weeklyListPattern = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(,(Mon|Tue|Wed|Thu|Fri|Sat|Sun))*$/;
        const compressedPattern = /^Compressed\(\d{1,2}h x \d{1,2}d\)$/;
        const rotationPattern = /^\d+on-\d+off$/;
        const valid = flexiblePattern.test(pattern) ||
            weeklyListPattern.test(pattern) ||
            compressedPattern.test(pattern) ||
            rotationPattern.test(pattern);
        if (!valid) {
            throw new common_1.BadRequestException('Invalid scheduling pattern. Supported examples: "4on-3off", "Mon,Wed,Fri", "Flex(08:00-10:00,16:00-18:00)", "Compressed(10h x 4d)".');
        }
    }
    async notifyUpcomingShiftExpiry(daysBefore = 3) {
        const now = new Date();
        const targetDate = new Date();
        targetDate.setDate(now.getDate() + daysBefore);
        const expiringSoon = await this.shiftAssignmentModel.find({
            endDate: { $lte: targetDate, $gte: now },
            status: { $ne: 'EXPIRED' }
        }).populate('employeeId');
        if (!expiringSoon.length)
            return { message: 'No upcoming expirations.' };
        const hrAdmins = await this.employeeModel.find({ role: 'HR_ADMIN' });
        if (!hrAdmins.length)
            return { message: 'No HR admins found.' };
        const notifications = [];
        for (const assignment of expiringSoon) {
            for (const admin of hrAdmins) {
            }
        }
        await this.notificationLogModel.insertMany(notifications);
        return {
            notifiedAdmins: hrAdmins.length,
            records: expiringSoon.length,
        };
    }
    async handleShiftExpiryCron() {
        await this.notifyUpcomingShiftExpiry(3);
        await this.expireShiftAssignmentsAutomatically();
        return { message: 'Shift expiry cycle complete.' };
    }
    async logPunchFromExternalSheet(input) {
        const employee = await this.employeeModel.findOne({ email: input.employeeIdentifier });
        if (!employee) {
            throw new common_1.NotFoundException(`Employee not found for identifier: ${input.employeeIdentifier}`);
        }
        const punchDateTime = this.combineDateAndTime(input.date, input.time);
        const attendance = await this.getOrCreateAttendanceRecordForDate(employee._id, punchDateTime);
        attendance.punches.push({
            type: input.type,
            time: punchDateTime,
        });
        this.recalculateAttendanceDerivedFields(attendance);
        await attendance.save();
        return attendance;
    }
    async clockIn(employeeIdentifier) {
        const employee = await this.employeeModel.findOne({ email: employeeIdentifier });
        if (!employee) {
            throw new common_1.NotFoundException(`Employee not found for identifier: ${employeeIdentifier}`);
        }
        const now = new Date();
        const attendance = await this.getOrCreateAttendanceRecordForDate(employee._id, now);
        attendance.punches.push({
            type: enums_1.PunchType.IN,
            time: now,
        });
        this.recalculateAttendanceDerivedFields(attendance);
        await attendance.save();
        return attendance;
    }
    async clockOut(employeeIdentifier) {
        const employee = await this.employeeModel.findOne({ email: employeeIdentifier });
        if (!employee) {
            throw new common_1.NotFoundException(`Employee not found for identifier: ${employeeIdentifier}`);
        }
        const now = new Date();
        const attendance = await this.getOrCreateAttendanceRecordForDate(employee._id, now);
        attendance.punches.push({
            type: enums_1.PunchType.OUT,
            time: now,
        });
        this.recalculateAttendanceDerivedFields(attendance);
        await attendance.save();
        return attendance;
    }
    combineDateAndTime(dateStr, timeStr) {
        const iso = `${dateStr}T${timeStr}:00`;
        const d = new Date(iso);
        if (isNaN(d.getTime())) {
            throw new common_1.BadRequestException(`Invalid date/time combination: ${dateStr} ${timeStr}`);
        }
        return d;
    }
    async getOrCreateAttendanceRecordForDate(employeeId, date) {
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
    recalculateAttendanceDerivedFields(record) {
        if (!record.punches || record.punches.length === 0) {
            record.totalWorkMinutes = 0;
            record.hasMissedPunch = false;
            return;
        }
        const punches = [...record.punches].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        let totalMinutes = 0;
        let expectingOut = false;
        let lastInTime = null;
        let hasMissed = false;
        for (const punch of punches) {
            const punchTime = new Date(punch.time);
            if (punch.type === enums_1.PunchType.IN) {
                if (expectingOut)
                    hasMissed = true;
                lastInTime = punchTime;
                expectingOut = true;
            }
            else if (punch.type === enums_1.PunchType.OUT) {
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
        if (expectingOut)
            hasMissed = true;
        record.totalWorkMinutes = totalMinutes;
        record.hasMissedPunch = hasMissed;
    }
    async correctAttendance(input) {
        const dateStart = new Date(`${input.date}T00:00:00`);
        const dateEnd = new Date(`${input.date}T23:59:59`);
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
        record.punches = input.newPunches.map((p) => ({
            type: p.type,
            time: new Date(`${input.date}T${p.time}:00`)
        }));
        this.recalculateAttendanceDerivedFields(record);
        record.finalisedForPayroll = false;
        await record.save();
        const audit = new this.correctionRequestModel({
            employeeId: input.employeeId,
            attendanceRecord: record._id,
            reason: input.reason,
            status: 'APPROVED',
        });
        await audit.save();
        await this.notificationLogModel.create({
            to: input.employeeId,
            type: 'ATTENDANCE_CORRECTED',
            message: `Your attendance for ${input.date} was corrected by your manager.`,
        });
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
    async getPunchPolicyForEmployeeOnDate(employeeId, date) {
        const assignment = await this.shiftAssignmentModel
            .findOne({
            employeeId,
            startDate: { $lte: date },
            $or: [{ endDate: { $gte: date } }, { endDate: null }],
            status: 'APPROVED',
        })
            .populate('shiftId');
        if (!assignment || !assignment.shiftId) {
            return enums_1.PunchPolicy.MULTIPLE;
        }
        return assignment.shiftId.punchPolicy ?? enums_1.PunchPolicy.MULTIPLE;
    }
    async applyPunchPolicy(employeeId, record, incomingPunch) {
        const policy = await this.getPunchPolicyForEmployeeOnDate(employeeId, incomingPunch.time);
        if (policy === enums_1.PunchPolicy.MULTIPLE) {
            record.punches.push(incomingPunch);
            return;
        }
        const punches = record.punches.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        if (policy === enums_1.PunchPolicy.FIRST_LAST) {
            if (incomingPunch.type === enums_1.PunchType.IN) {
                const hasIn = punches.some((p) => p.type === enums_1.PunchType.IN);
                if (!hasIn)
                    record.punches.push(incomingPunch);
                return;
            }
            if (incomingPunch.type === enums_1.PunchType.OUT) {
                const outs = punches.filter((p) => p.type === enums_1.PunchType.OUT);
                if (outs.length > 0) {
                    outs[outs.length - 1].time = incomingPunch.time;
                }
                else {
                    record.punches.push(incomingPunch);
                }
                return;
            }
        }
        if (policy === enums_1.PunchPolicy.ONLY_FIRST) {
            if (incomingPunch.type === enums_1.PunchType.IN) {
                const hasIn = punches.some((p) => p.type === enums_1.PunchType.IN);
                if (!hasIn)
                    record.punches.push(incomingPunch);
            }
            return;
        }
    }
    async createMissedPunchException(employeeId, attendanceRecordId, reason) {
        const exception = new this.timeExceptionModel({
            employeeId,
            attendanceRecordId,
            type: enums_1.TimeExceptionType.MISSED_PUNCH,
            status: enums_1.TimeExceptionStatus.OPEN,
            reason,
            assignedTo: employeeId,
        });
        await exception.save();
        return exception;
    }
    async notifyMissedPunch(employeeId, message) {
        const notification = new this.notificationLogModel({
            to: employeeId,
            type: 'MISSED_PUNCH',
            message,
        });
        await notification.save();
    }
    async processMissedPunchExceptions(attendance) {
        if (!attendance.hasMissedPunch)
            return;
        const existing = await this.timeExceptionModel.findOne({
            attendanceRecordId: attendance._id,
            type: enums_1.TimeExceptionType.MISSED_PUNCH,
            status: enums_1.TimeExceptionStatus.OPEN,
        });
        if (existing)
            return;
        await this.createMissedPunchException(attendance.employeeId, attendance._id, 'System detected missing punch(es) for this day.');
        await this.notifyMissedPunch(attendance.employeeId, 'You have a missing punch. Please submit a correction request.');
    }
    buildPayrollSyncPayload(attendance) {
        return {
            employeeId: attendance.employeeId,
            attendanceRecordId: attendance._id,
            totalWorkMinutes: attendance.totalWorkMinutes,
            hasMissedPunch: attendance.hasMissedPunch,
            punches: attendance.punches.map((p) => ({
                type: p.type,
                time: p.time,
            })),
            date: attendance.punches.length > 0
                ? new Date(attendance.punches[0].time).toISOString().split('T')[0]
                : null,
        };
    }
    async sendToPayrollSystems(payload) {
        console.log('Syncing with Payroll system:', payload);
    }
    async sendToLeaveSystem(payload) {
        console.log('Syncing with Leaves subsystem:', payload);
    }
    async syncAttendanceWithPayroll() {
        const recordsToSync = await this.attendanceRecordModel.find({
            finalisedForPayroll: true,
            syncedWithPayroll: { $ne: true },
        });
        if (recordsToSync.length === 0)
            return;
        for (const record of recordsToSync) {
            const payload = this.buildPayrollSyncPayload(record);
            await this.sendToPayrollSystems(payload);
            await this.sendToLeaveSystem(payload);
            record.finalisedForPayroll = true;
            await record.save();
        }
    }
    async runDailyPayrollSync() {
        console.log('Starting daily attendance-to-payroll sync...');
        await this.syncAttendanceWithPayroll();
        console.log('Daily payroll sync completed.');
    }
    validateOvertimeRuleInput(dto) {
        if (!dto.name || dto.name.trim().length === 0) {
            throw new common_1.BadRequestException('Rule name is required.');
        }
        const forbidden = ['invalid', 'none', 'test', 'placeholder'];
        if (forbidden.includes(dto.name.toLowerCase())) {
            throw new common_1.BadRequestException('Invalid rule name.');
        }
        if (dto.description && dto.description.length < 3) {
            throw new common_1.BadRequestException('Description is too short.');
        }
    }
    async createOvertimeRule(dto) {
        this.validateOvertimeRuleInput(dto);
        const exists = await this.overtimeRuleModel.findOne({ name: dto.name });
        if (exists) {
            throw new common_1.BadRequestException('An overtime rule with this name already exists.');
        }
        const rule = new this.overtimeRuleModel({
            name: dto.name,
            description: dto.description ?? '',
            active: true,
            approved: false,
        });
        await rule.save();
        return rule;
    }
    async updateOvertimeRule(ruleId, dto) {
        const rule = await this.overtimeRuleModel.findById(ruleId);
        if (!rule)
            throw new common_1.NotFoundException('Overtime rule not found.');
        if (dto.name)
            rule.name = dto.name;
        if (dto.description !== undefined)
            rule.description = dto.description;
        if (dto.active !== undefined)
            rule.active = dto.active;
        this.validateOvertimeRuleInput({ name: rule.name, description: rule.description });
        await rule.save();
        return rule;
    }
    async approveOvertimeRule(ruleId) {
        const rule = await this.overtimeRuleModel.findById(ruleId);
        if (!rule)
            throw new common_1.NotFoundException('Overtime rule not found.');
        if (rule.approved) {
            throw new common_1.BadRequestException('Rule is already approved.');
        }
        rule.approved = true;
        await rule.save();
        return rule;
    }
    async toggleOvertimeRule(ruleId, activate) {
        const rule = await this.overtimeRuleModel.findById(ruleId);
        if (!rule)
            throw new common_1.NotFoundException('Overtime rule not found.');
        rule.active = activate;
        await rule.save();
        return rule;
    }
    async listOvertimeRules(filter) {
        const query = {};
        if (filter?.active !== undefined)
            query.active = filter.active;
        return this.overtimeRuleModel.find(query);
    }
    validateLatenessRuleInput(dto) {
        if (!dto.name || dto.name.trim().length < 2) {
            throw new common_1.BadRequestException('Rule name is required and must be valid.');
        }
        const forbidden = ['test', 'invalid', 'placeholder', 'none'];
        if (forbidden.includes(dto.name.toLowerCase())) {
            throw new common_1.BadRequestException('Invalid rule name.');
        }
        if (dto.gracePeriodMinutes !== undefined && dto.gracePeriodMinutes < 0) {
            throw new common_1.BadRequestException('Grace period cannot be negative.');
        }
        if (dto.deductionForEachMinute !== undefined &&
            dto.deductionForEachMinute < 0) {
            throw new common_1.BadRequestException('Deduction cannot be negative.');
        }
    }
    async createLatenessRule(dto) {
        this.validateLatenessRuleInput(dto);
        const exists = await this.latenessRuleModel.findOne({ name: dto.name });
        if (exists) {
            throw new common_1.BadRequestException('A lateness rule with this name already exists.');
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
    async updateLatenessRule(ruleId, dto) {
        const rule = await this.latenessRuleModel.findById(ruleId);
        if (!rule)
            throw new common_1.NotFoundException('Lateness rule not found.');
        if (dto.name)
            rule.name = dto.name;
        if (dto.description !== undefined)
            rule.description = dto.description;
        if (dto.gracePeriodMinutes !== undefined)
            rule.gracePeriodMinutes = dto.gracePeriodMinutes;
        if (dto.deductionForEachMinute !== undefined)
            rule.deductionForEachMinute = dto.deductionForEachMinute;
        if (dto.active !== undefined)
            rule.active = dto.active;
        this.validateLatenessRuleInput({
            name: rule.name,
            description: rule.description,
            gracePeriodMinutes: rule.gracePeriodMinutes,
            deductionForEachMinute: rule.deductionForEachMinute,
        });
        await rule.save();
        return rule;
    }
    async toggleLatenessRule(ruleId, activate) {
        const rule = await this.latenessRuleModel.findById(ruleId);
        if (!rule)
            throw new common_1.NotFoundException('Lateness rule not found.');
        rule.active = activate;
        await rule.save();
        return rule;
    }
    async listLatenessRules(filter) {
        const query = {};
        if (filter?.active !== undefined)
            query.active = filter.active;
        return this.latenessRuleModel.find(query);
    }
    calculateMinutesLate(punches, shiftStartTime, gracePeriod) {
        const firstIn = punches
            .filter((p) => p.type === 'IN')
            .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())[0];
        if (!firstIn)
            return 0;
        const [hh, mm] = shiftStartTime.split(':').map(Number);
        const scheduled = new Date(firstIn.time);
        scheduled.setHours(hh, mm, 0, 0);
        const diffMinutes = Math.round((new Date(firstIn.time).getTime() - scheduled.getTime()) / 60000);
        return diffMinutes > gracePeriod ? diffMinutes : 0;
    }
    async countLatenessExceptions(employeeId, days) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        return this.timeExceptionModel.countDocuments({
            employeeId,
            type: enums_1.TimeExceptionType.LATE,
            createdAt: { $gte: since },
        });
    }
    async handleRepeatedLateness(attendance, shiftStartTime) {
        const rule = await this.latenessRuleModel.findOne({ active: true });
        if (!rule)
            return;
        const minutesLate = this.calculateMinutesLate(attendance.punches, shiftStartTime, rule.gracePeriodMinutes);
        if (minutesLate <= 0)
            return;
        await this.timeExceptionModel.create({
            employeeId: attendance.employeeId,
            attendanceRecordId: attendance._id,
            type: enums_1.TimeExceptionType.LATE,
            status: enums_1.TimeExceptionStatus.OPEN,
            reason: ` Late by ${minutesLate} minutes.`,
            assignedTo: attendance.employeeId,
        });
        const incidents = await this.countLatenessExceptions(attendance.employeeId, 30);
        const threshold = 3;
        if (incidents >= threshold) {
            await this.timeExceptionModel.create({
                employeeId: attendance.employeeId,
                attendanceRecordId: attendance._id,
                type: enums_1.TimeExceptionType.LATE,
                status: enums_1.TimeExceptionStatus.ESCALATED,
                reason: ` Repeated lateness detected (${incidents} times in 30 days).`,
                assignedTo: attendance.employeeId,
            });
            await this.notificationLogModel.create({
                to: attendance.employeeId,
                type: 'REPEATED_LATENESS',
                message: `You have been late ${incidents} times. Your case has been escalated.`,
            });
        }
    }
    async getAttendanceRecordById(id) {
        const record = await this.attendanceRecordModel.findById(id);
        if (!record) {
            throw new common_1.NotFoundException('Attendance record not found.');
        }
        return record;
    }
    async submitAttendanceCorrectionRequest(dto) {
        const record = await this.attendanceRecordModel.findById(dto.attendanceRecordId);
        if (!record) {
            throw new common_1.NotFoundException('Attendance record not found.');
        }
        const exists = await this.attendanceCorrectionRequestModel.findOne({
            employeeId: dto.employeeId,
            attendanceRecord: dto.attendanceRecordId,
            status: {
                $in: [
                    enums_1.CorrectionRequestStatus.SUBMITTED,
                    enums_1.CorrectionRequestStatus.IN_REVIEW,
                    enums_1.CorrectionRequestStatus.ESCALATED,
                ],
            },
        });
        if (exists) {
            throw new common_1.BadRequestException('A correction request for this attendance record is already pending.');
        }
        const request = new this.attendanceCorrectionRequestModel({
            employeeId: dto.employeeId,
            attendanceRecord: dto.attendanceRecordId,
            reason: dto.reason,
            status: enums_1.CorrectionRequestStatus.SUBMITTED,
        });
        await request.save();
        await this.notificationLogModel.create({
            to: dto.employeeId,
            type: 'CORRECTION_REQUEST_SUBMITTED',
            message: 'Your attendance correction request has been submitted.',
        });
        return request;
    }
    async getMyCorrectionRequests(employeeId) {
        return this.attendanceCorrectionRequestModel
            .find({ employeeId })
            .populate('attendanceRecord');
    }
    async reviewCorrectionRequest(requestId, newStatus, reviewerId) {
        const request = await this.attendanceCorrectionRequestModel.findById(requestId);
        if (!request)
            throw new common_1.NotFoundException('Correction request not found.');
        if (request.status !== enums_1.CorrectionRequestStatus.SUBMITTED &&
            request.status !== enums_1.CorrectionRequestStatus.IN_REVIEW) {
            throw new common_1.BadRequestException('Request cannot be updated in its current status.');
        }
        request.status = newStatus;
        await request.save();
        await this.notificationLogModel.create({
            to: request.employeeId,
            type: 'CORRECTION_REQUEST_DECISION',
            message: `Your correction request was ${newStatus.toLowerCase()}.`,
        });
        return request;
    }
    async autoEscalateStaleCorrectionRequests() {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 3);
        const requests = await this.attendanceCorrectionRequestModel.find({
            status: enums_1.CorrectionRequestStatus.SUBMITTED,
            createdAt: { $lte: cutoff },
        });
        for (const req of requests) {
            req.status = enums_1.CorrectionRequestStatus.ESCALATED;
            await req.save();
            await this.notificationLogModel.create({
                to: req.employeeId,
                type: 'CORRECTION_REQUEST_ESCALATED',
                message: 'Your attendance correction request was escalated due to inactivity.',
            });
        }
    }
    async getPendingTimeExceptionsForReview(reviewerId) {
        return this.timeExceptionModel
            .find({
            status: enums_1.TimeExceptionStatus.PENDING,
            assignedTo: reviewerId,
        })
            .populate('attendanceRecordId');
    }
    async reviewTimeException(exceptionId, reviewerId, newStatus, comment) {
        const exception = await this.timeExceptionModel.findById(exceptionId);
        if (!exception) {
            throw new common_1.NotFoundException('Time exception not found.');
        }
        if (exception.assignedTo?.toString() !== reviewerId.toString()) {
            throw new common_1.BadRequestException('You are not allowed to review this exception.');
        }
        if (exception.status !== enums_1.TimeExceptionStatus.PENDING &&
            exception.status !== enums_1.TimeExceptionStatus.OPEN) {
            throw new common_1.BadRequestException('Exception cannot be updated in its current status.');
        }
        exception.status = newStatus;
        if (comment)
            exception.reason = comment;
        await exception.save();
        await this.notificationLogModel.create({
            to: exception.employeeId,
            type: 'TIME_EXCEPTION_DECISION',
            message: `Your time exception was ${newStatus.toLowerCase()}.`,
        });
        return exception;
    }
    async getPendingCorrectionRequests() {
        return this.attendanceCorrectionRequestModel
            .find({
            status: {
                $in: [
                    enums_1.CorrectionRequestStatus.SUBMITTED,
                    enums_1.CorrectionRequestStatus.IN_REVIEW,
                ],
            },
        })
            .populate('attendanceRecord');
    }
    async reviewCorrectionRequestWorkflow(requestId, reviewerId, newStatus) {
        const request = await this.attendanceCorrectionRequestModel.findById(requestId);
        if (!request)
            throw new common_1.NotFoundException('Correction request not found.');
        if (request.status !== enums_1.CorrectionRequestStatus.SUBMITTED &&
            request.status !== enums_1.CorrectionRequestStatus.IN_REVIEW) {
            throw new common_1.BadRequestException('This request has already been processed.');
        }
        request.status = newStatus;
        await request.save();
        await this.notificationLogModel.create({
            to: request.employeeId,
            type: 'CORRECTION_REQUEST_DECISION',
            message: ` Your attendance correction request was ${newStatus.toLowerCase()}.`,
        });
        return request;
    }
    async autoEscalateUnresolvedExceptions() {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 3);
        const items = await this.timeExceptionModel.find({
            status: { $in: [enums_1.TimeExceptionStatus.OPEN, enums_1.TimeExceptionStatus.PENDING] },
            createdAt: { $lte: cutoff },
        });
        for (const item of items) {
            item.status = enums_1.TimeExceptionStatus.ESCALATED;
            await item.save();
            await this.notificationLogModel.create({
                to: item.employeeId,
                type: 'TIME_EXCEPTION_ESCALATED',
                message: 'Your time exception has been escalated due to inactivity.',
            });
        }
    }
    async autoEscalateStaleCorrectionRequestsForPayroll() {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 3);
        const requests = await this.attendanceCorrectionRequestModel.find({
            status: enums_1.CorrectionRequestStatus.SUBMITTED,
            createdAt: { $lte: cutoff },
        });
        for (const req of requests) {
            req.status = enums_1.CorrectionRequestStatus.ESCALATED;
            await req.save();
            await this.notificationLogModel.create({
                to: req.employeeId,
                type: 'CORRECTION_REQUEST_ESCALATED',
                message: 'Your correction request was escalated before payroll cutoff.',
            });
        }
    }
    validatePermissionDuration(minutes, maxMinutes, type) {
        if (minutes <= 0) {
            throw new common_1.BadRequestException('Permission duration must be greater than zero.');
        }
        if (minutes > maxMinutes) {
            throw new common_1.BadRequestException(`Maximum allowed duration for ${type} is ${maxMinutes} minutes.`);
        }
    }
    async submitPermissionRequest(dto) {
        const limits = {
            [enums_1.TimeExceptionType.EARLY_LEAVE]: 120,
            [enums_1.TimeExceptionType.SHORT_TIME]: 180,
            [enums_1.TimeExceptionType.OVERTIME_REQUEST]: 300,
            [enums_1.TimeExceptionType.MANUAL_ADJUSTMENT]: 60,
        };
        const maxAllowed = limits[dto.type] ?? 180;
        this.validatePermissionDuration(dto.minutesRequested, maxAllowed, dto.type);
        const record = await this.attendanceRecordModel.findById(dto.attendanceRecordId);
        if (!record) {
            throw new common_1.NotFoundException('Attendance record not found.');
        }
        const exists = await this.timeExceptionModel.findOne({
            employeeId: dto.employeeId,
            attendanceRecordId: dto.attendanceRecordId,
            type: dto.type,
            status: {
                $in: [
                    enums_1.TimeExceptionStatus.OPEN,
                    enums_1.TimeExceptionStatus.PENDING,
                    enums_1.TimeExceptionStatus.ESCALATED,
                ],
            },
        });
        if (exists) {
            throw new common_1.BadRequestException('A similar permission request is already pending.');
        }
        const permission = await this.timeExceptionModel.create({
            employeeId: dto.employeeId,
            attendanceRecordId: dto.attendanceRecordId,
            type: dto.type,
            status: enums_1.TimeExceptionStatus.PENDING,
            reason: dto.reason ?? '',
            assignedTo: dto.employeeId,
            minutesRequested: dto.minutesRequested,
        });
        await this.notificationLogModel.create({
            to: dto.employeeId,
            type: 'PERMISSION_SUBMITTED',
            message: `Your permission request for ${dto.type} has been submitted.`,
        });
        return permission;
    }
    async reviewPermissionRequest(exceptionId, reviewerId, newStatus, comment) {
        const exception = await this.timeExceptionModel.findById(exceptionId);
        if (!exception) {
            throw new common_1.NotFoundException('Permission request not found.');
        }
        if (exception.status !== enums_1.TimeExceptionStatus.PENDING &&
            exception.status !== enums_1.TimeExceptionStatus.OPEN) {
            throw new common_1.BadRequestException('This permission is no longer editable.');
        }
        exception.status = newStatus;
        if (comment)
            exception.reason = comment;
        await exception.save();
        await this.notificationLogModel.create({
            to: exception.employeeId,
            type: 'PERMISSION_DECISION',
            message: `Your permission request was ${newStatus.toLowerCase()}.`,
        });
        return exception;
    }
    async getApprovedPermissionsForPayroll(employeeId, dateRange) {
        return this.timeExceptionModel.find({
            employeeId,
            status: enums_1.TimeExceptionStatus.APPROVED,
            type: {
                $in: [
                    enums_1.TimeExceptionType.EARLY_LEAVE,
                    enums_1.TimeExceptionType.SHORT_TIME,
                    enums_1.TimeExceptionType.OVERTIME_REQUEST,
                ],
            },
            createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        });
    }
    async autoEscalatePendingPermissions() {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 3);
        const pending = await this.timeExceptionModel.find({
            status: enums_1.TimeExceptionStatus.PENDING,
            createdAt: { $lte: cutoff },
        });
        for (const req of pending) {
            req.status = enums_1.TimeExceptionStatus.ESCALATED;
            await req.save();
            await this.notificationLogModel.create({
                to: req.employeeId,
                type: 'PERMISSION_ESCALATED',
                message: `Your permission request has been escalated due to delay.`,
            });
        }
    }
    async fetchApprovedLeaves(employeeId, range) {
        try {
            const leaves = await this.leaveRequestService
                .find({
                employeeId,
                status: 'APPROVED',
                date: { $gte: range.start, $lte: range.end },
            })
                .select('date')
                .lean();
            return leaves.map((l) => {
                const d = l.date instanceof Date ? l.date : new Date(l.date);
                if (isNaN(d.getTime())) {
                    return { date: String(l.date) };
                }
                return { date: d.toISOString().split('T')[0] };
            });
        }
        catch (err) {
            throw new common_1.BadRequestException('Failed to load approved leaves from Leaves subsystem.');
        }
    }
    async applyLeaveToAttendance(employeeId, leaveDays) {
        for (const entry of leaveDays) {
            const leaveDate = new Date(entry.date);
            let record = await this.attendanceRecordModel.findOne({
                employeeId,
                day: entry.date,
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
            record.totalWorkMinutes = 0;
            record.hasMissedPunch = false;
            record.finalisedForPayroll = true;
            await record.save();
        }
    }
    async integrateVacationPackages(employeeId, range) {
        const leaveDays = await this.fetchApprovedLeaves(employeeId, range);
        if (leaveDays.length === 0) {
            return { message: 'No approved leaves for this employee in this range.' };
        }
        await this.applyLeaveToAttendance(employeeId, leaveDays);
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
    async createHoliday(dto) {
        const holiday = new this.holidayModel(dto);
        return holiday.save();
    }
    async getHolidaysForDate(date) {
        return this.holidayModel.find({
            active: true,
            startDate: { $lte: date },
            $or: [{ endDate: { $gte: date } }, { endDate: null }],
        });
    }
    async isHoliday(date) {
        const list = await this.getHolidaysForDate(date);
        return list.length > 0;
    }
    async applyHolidayRules(employeeId, date) {
        const isHoliday = await this.isHoliday(date);
        if (!isHoliday)
            return;
        let record = await this.attendanceRecordModel.findOne({
            employeeId,
            'punches.time': {
                $gte: new Date(date.setHours(0, 0, 0, 0)),
                $lte: new Date(date.setHours(23, 59, 59, 999)),
            },
        });
        if (!record) {
            record = new this.attendanceRecordModel({
                employeeId,
                punches: [],
                totalWorkMinutes: 0,
                hasMissedPunch: false,
                finalisedForPayroll: true,
            });
        }
        record.totalWorkMinutes = 0;
        record.hasMissedPunch = false;
        record.finalisedForPayroll = true;
        await record.save();
        await this.notificationLogModel.create({
            to: employeeId,
            type: 'HOLIDAY_APPLIED',
            message: `Holiday rules applied for ${date.toDateString()}.`,
        });
    }
    async applyHolidayRange(employeeId, range) {
        const days = [];
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
    async escalateCorrectionRequests(cutoff) {
        const pending = await this.correctionRequestModel.find({
            status: { $in: ['SUBMITTED', 'IN_REVIEW'] },
            createdAt: { $lte: cutoff },
        });
        for (const req of pending) {
            req.status = enums_1.CorrectionRequestStatus.ESCALATED;
            await req.save();
            await this.notificationLogModel.create({
                to: req.employeeId,
                type: 'REQUEST_ESCALATED',
                message: `Your attendance correction request was escalated due to payroll cut-off.`,
            });
        }
        return pending.length;
    }
    async escalateTimeExceptions(cutoff) {
        const pending = await this.timeExceptionModel.find({
            status: { $in: ['OPEN', 'PENDING'] },
            createdAt: { $lte: cutoff },
        });
        for (const ex of pending) {
            ex.status = enums_1.TimeExceptionStatus.ESCALATED;
            await ex.save();
            await this.notificationLogModel.create({
                to: ex.employeeId,
                type: 'EXCEPTION_ESCALATED',
                message: `Your time exception request was escalated due to payroll cut-off.`,
            });
        }
        return pending.length;
    }
    async escalatePendingRequestsBeforePayroll(cutoffDate) {
        const corrections = await this.escalateCorrectionRequests(cutoffDate);
        const exceptions = await this.escalateTimeExceptions(cutoffDate);
        return {
            message: 'Escalation process completed before payroll cut-off.',
            correctionRequestsEscalated: corrections,
            timeExceptionsEscalated: exceptions,
        };
    }
    async getOvertimeReport(range) {
        const records = await this.attendanceRecordModel
            .find({
            'punches.time': {
                $gte: range.start,
                $lte: range.end,
            },
        })
            .populate('employeeId')
            .lean();
        const report = records.map((rec) => {
            const emp = rec.employeeId;
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
    async getExceptionReport(range) {
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
            const emp = ex.employeeId;
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
    exportToCsv(data, fileName) {
        const parser = new json2csv_1.Parser({ header: true });
        const csv = parser.parse(data);
        return {
            fileName,
            mimeType: 'text/csv',
            content: csv,
        };
    }
    async generateOvertimeReport(range, exportAsCsv = false) {
        const report = await this.getOvertimeReport(range);
        if (!exportAsCsv)
            return report;
        return this.exportToCsv(report, 'overtime-report.csv');
    }
    async generateExceptionReport(range, exportAsCsv = false) {
        const report = await this.getExceptionReport(range);
        if (!exportAsCsv)
            return report;
        return this.exportToCsv(report, 'exception-report.csv');
    }
    async fetchAttendanceForSync(range) {
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
    async fetchTimeExceptionsForSync(range) {
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
    async fetchCorrectionRequestsForSync(range) {
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
    buildSyncPayload(attendance, exceptions, corrections) {
        return {
            timestamp: new Date(),
            attendance: attendance.map((rec) => ({
                employeeId: rec.employeeId?._id,
                employeeName: rec.employeeId?.fullName,
                totalWorkMinutes: rec.totalWorkMinutes,
                hasMissedPunch: rec.hasMissedPunch,
                punches: rec.punches,
            })),
            timeExceptions: exceptions.map((ex) => ({
                employeeId: ex.employeeId?._id,
                type: ex.type,
                status: ex.status,
                reason: ex.reason,
                createdAt: ex.createdAt,
            })),
            correctionRequests: corrections.map((r) => ({
                employeeId: r.employeeId?._id,
                status: r.status,
                reason: r.reason,
                createdAt: r.createdAt,
            })),
        };
    }
    async syncToPayroll(payload) {
        try {
            await this.payrollTrackingService.applyAttendanceSync(payload);
        }
        catch (err) {
            throw new common_1.BadRequestException('Failed to sync with Payroll module.');
        }
    }
    async syncToLeaves(payload) {
        try {
            await this.leavesService.updateTimeManagementSync(payload);
        }
        catch (err) {
            throw new common_1.BadRequestException('Failed to sync with Leaves module.');
        }
    }
    async syncCrossModuleData(range) {
        const attendance = await this.fetchAttendanceForSync(range);
        const exceptions = await this.fetchTimeExceptionsForSync(range);
        const corrections = await this.fetchCorrectionRequestsForSync(range);
        const payload = this.buildSyncPayload(attendance, exceptions, corrections);
        await this.syncToPayroll(payload);
        await this.syncToLeaves(payload);
        return {
            message: 'Cross-module synchronization completed successfully.',
            attendanceCount: attendance.length,
            exceptionCount: exceptions.length,
            correctionRequestCount: corrections.length,
        };
    }
};
exports.TimeManagementService = TimeManagementService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TimeManagementService.prototype, "runDailyPayrollSync", null);
exports.TimeManagementService = TimeManagementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(shift_assignment_schema_1.ShiftAssignment.name)),
    __param(1, (0, mongoose_1.InjectModel)(shift_schema_1.Shift.name)),
    __param(2, (0, mongoose_1.InjectModel)(shift_type_schema_1.ShiftType.name)),
    __param(3, (0, mongoose_1.InjectModel)(schedule_rule_schema_1.ScheduleRule.name)),
    __param(4, (0, mongoose_1.InjectModel)(employee_profile_schema_1.EmployeeProfile.name)),
    __param(5, (0, mongoose_1.InjectModel)(department_schema_1.Department.name)),
    __param(6, (0, mongoose_1.InjectModel)(position_schema_1.Position.name)),
    __param(7, (0, mongoose_1.InjectModel)(notification_log_schema_1.NotificationLog.name)),
    __param(8, (0, mongoose_1.InjectModel)(attendance_record_schema_1.AttendanceRecord.name)),
    __param(9, (0, mongoose_1.InjectModel)(attendance_correction_request_schema_1.AttendanceCorrectionRequest.name)),
    __param(10, (0, mongoose_1.InjectModel)(time_exception_schema_1.TimeException.name)),
    __param(11, (0, mongoose_1.InjectModel)(overtime_rule_schema_1.OvertimeRule.name)),
    __param(12, (0, mongoose_1.InjectModel)(lateness_rule_schema_1.LatenessRule.name)),
    __param(13, (0, mongoose_1.InjectModel)(attendance_correction_request_schema_1.AttendanceCorrectionRequest.name)),
    __param(14, (0, mongoose_1.InjectModel)(leave_request_schema_1.LeaveRequest.name)),
    __param(15, (0, mongoose_1.InjectModel)(holiday_schema_1.Holiday.name)),
    __param(16, (0, common_1.Inject)(leaves_service_1.LeavesService)),
    __param(17, (0, common_1.Inject)(payroll_tracking_service_1.PayrollTrackingService)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        leaves_service_1.LeavesService,
        payroll_tracking_service_1.PayrollTrackingService])
], TimeManagementService);
//# sourceMappingURL=time-management.service.js.map