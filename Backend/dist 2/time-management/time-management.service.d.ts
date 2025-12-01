import { Model, Types } from 'mongoose';
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
import { NotificationLogDocument } from './models/notification-log.schema';
import { LeaveRequestDocument } from 'src/leaves/models/leave-request.schema';
import { LeavesService } from 'src/leaves/leaves.service';
import { PayrollTrackingService } from 'src/payroll-tracking/payroll-tracking.service';
import { PunchType, CorrectionRequestStatus, TimeExceptionStatus, TimeExceptionType, HolidayType, ShiftAssignmentStatus } from './models/enums';
import { ShiftAssignmentCreateDTO } from './dto/shift-assignment-create.dto';
import { ShiftAssignmentUpdateDTO } from './dto/shift-assignment-update.dto';
export declare class TimeManagementService {
    private readonly shiftAssignmentModel;
    private readonly shiftModel;
    private readonly shiftTypeModel;
    private readonly scheduleRuleModel;
    private readonly employeeModel;
    private readonly departmentModel;
    private readonly positionModel;
    private readonly notificationLogModel;
    private readonly attendanceRecordModel;
    private readonly correctionRequestModel;
    private readonly timeExceptionModel;
    private readonly overtimeRuleModel;
    private readonly latenessRuleModel;
    private readonly attendanceCorrectionRequestModel;
    private readonly leaveRequestService;
    private readonly holidayModel;
    private readonly leavesService;
    private readonly payrollTrackingService;
    constructor(shiftAssignmentModel: Model<ShiftAssignmentDocument>, shiftModel: Model<ShiftDocument>, shiftTypeModel: Model<ShiftTypeDocument>, scheduleRuleModel: Model<ScheduleRuleDocument>, employeeModel: Model<any>, departmentModel: Model<any>, positionModel: Model<any>, notificationLogModel: Model<NotificationLogDocument>, attendanceRecordModel: Model<AttendanceRecordDocument>, correctionRequestModel: Model<AttendanceCorrectionRequestDocument>, timeExceptionModel: Model<TimeExceptionDocument>, overtimeRuleModel: Model<OvertimeRuleDocument>, latenessRuleModel: Model<LatenessRuleDocument>, attendanceCorrectionRequestModel: Model<AttendanceCorrectionRequestDocument>, leaveRequestService: Model<LeaveRequestDocument>, holidayModel: Model<HolidayDocument>, leavesService: LeavesService, payrollTrackingService: PayrollTrackingService);
    assignShiftToEmployee(dto: ShiftAssignmentCreateDTO): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, ShiftAssignment, {}, {}> & ShiftAssignment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, ShiftAssignment, {}, {}> & ShiftAssignment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    assignShiftToDepartment(departmentId: Types.ObjectId, dto: ShiftAssignmentCreateDTO): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, ShiftAssignment, {}, {}> & ShiftAssignment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, ShiftAssignment, {}, {}> & ShiftAssignment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>, Omit<{
        employeeId: any;
        status: ShiftAssignmentStatus;
        departmentId?: Types.ObjectId;
        positionId?: Types.ObjectId;
        shiftId: Types.ObjectId;
        scheduleRuleId?: Types.ObjectId;
        startDate: Date;
        endDate?: Date;
    }, "_id">>[]>;
    assignShiftToPosition(positionId: Types.ObjectId, dto: ShiftAssignmentCreateDTO): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, ShiftAssignment, {}, {}> & ShiftAssignment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, ShiftAssignment, {}, {}> & ShiftAssignment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>, Omit<{
        employeeId: any;
        status: ShiftAssignmentStatus;
        departmentId?: Types.ObjectId;
        positionId?: Types.ObjectId;
        shiftId: Types.ObjectId;
        scheduleRuleId?: Types.ObjectId;
        startDate: Date;
        endDate?: Date;
    }, "_id">>[]>;
    updateShiftAssignment(id: string, dto: ShiftAssignmentUpdateDTO): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, ShiftAssignment, {}, {}> & ShiftAssignment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, ShiftAssignment, {}, {}> & ShiftAssignment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    expireShiftAssignmentsAutomatically(): Promise<void>;
    private validateShiftAssignmentInput;
    private ensureShiftExists;
    private ensureScheduleRuleExists;
    private ensureEmployeeExists;
    private ensureDepartmentExists;
    private ensurePositionExists;
    private determineStatus;
    createShiftType(dto: {
        name: string;
        active?: boolean;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, ShiftType, {}, {}> & ShiftType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, ShiftType, {}, {}> & ShiftType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getAllShiftTypes(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, ShiftType, {}, {}> & ShiftType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, ShiftType, {}, {}> & ShiftType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    updateShiftType(id: string, dto: {
        name?: string;
        active?: boolean;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, ShiftType, {}, {}> & ShiftType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, ShiftType, {}, {}> & ShiftType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    deactivateShiftType(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, ShiftType, {}, {}> & ShiftType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, ShiftType, {}, {}> & ShiftType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    createShift(dto: {
        name: string;
        shiftType: Types.ObjectId;
        startTime: string;
        endTime: string;
        punchPolicy?: any;
        graceInMinutes?: number;
        graceOutMinutes?: number;
        requiresApprovalForOvertime?: boolean;
        active?: boolean;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Shift, {}, {}> & Shift & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Shift, {}, {}> & Shift & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getAllShifts(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Shift, {}, {}> & Shift & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Shift, {}, {}> & Shift & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    updateShift(id: string, dto: any): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Shift, {}, {}> & Shift & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Shift, {}, {}> & Shift & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    deactivateShift(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Shift, {}, {}> & Shift & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Shift, {}, {}> & Shift & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    private ensureShiftTypeExists;
    private ensureShiftTimesValid;
    createScheduleRule(dto: {
        name: string;
        pattern: string;
        active?: boolean;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, ScheduleRule, {}, {}> & ScheduleRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, ScheduleRule, {}, {}> & ScheduleRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getAllScheduleRules(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, ScheduleRule, {}, {}> & ScheduleRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, ScheduleRule, {}, {}> & ScheduleRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    updateScheduleRule(id: string, dto: {
        name?: string;
        pattern?: string;
        active?: boolean;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, ScheduleRule, {}, {}> & ScheduleRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, ScheduleRule, {}, {}> & ScheduleRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    deactivateScheduleRule(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, ScheduleRule, {}, {}> & ScheduleRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, ScheduleRule, {}, {}> & ScheduleRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    private validateSchedulingPattern;
    notifyUpcomingShiftExpiry(daysBefore?: number): Promise<{
        message: string;
        notifiedAdmins?: undefined;
        records?: undefined;
    } | {
        notifiedAdmins: number;
        records: number;
        message?: undefined;
    }>;
    handleShiftExpiryCron(): Promise<{
        message: string;
    }>;
    logPunchFromExternalSheet(input: {
        employeeIdentifier: string;
        date: string;
        time: string;
        type: PunchType;
    }): Promise<import("mongoose").Document<unknown, {}, AttendanceRecord, {}, {}> & AttendanceRecord & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    clockIn(employeeIdentifier: string): Promise<import("mongoose").Document<unknown, {}, AttendanceRecord, {}, {}> & AttendanceRecord & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    clockOut(employeeIdentifier: string): Promise<import("mongoose").Document<unknown, {}, AttendanceRecord, {}, {}> & AttendanceRecord & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    private combineDateAndTime;
    private getOrCreateAttendanceRecordForDate;
    private recalculateAttendanceDerivedFields;
    correctAttendance(input: {
        managerId: Types.ObjectId;
        employeeId: Types.ObjectId;
        date: string;
        newPunches: {
            type: PunchType;
            time: string;
        }[];
        reason: string;
    }): Promise<{
        message: string;
        attendanceRecord: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, AttendanceRecord, {}, {}> & AttendanceRecord & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, AttendanceRecord, {}, {}> & AttendanceRecord & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>;
        auditLog: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, AttendanceCorrectionRequest, {}, {}> & AttendanceCorrectionRequest & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, AttendanceCorrectionRequest, {}, {}> & AttendanceCorrectionRequest & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>;
    }>;
    private getPunchPolicyForEmployeeOnDate;
    private applyPunchPolicy;
    private createMissedPunchException;
    private notifyMissedPunch;
    private processMissedPunchExceptions;
    private buildPayrollSyncPayload;
    private sendToPayrollSystems;
    private sendToLeaveSystem;
    private syncAttendanceWithPayroll;
    runDailyPayrollSync(): Promise<void>;
    private validateOvertimeRuleInput;
    createOvertimeRule(dto: {
        name: string;
        description?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, OvertimeRule, {}, {}> & OvertimeRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, OvertimeRule, {}, {}> & OvertimeRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    updateOvertimeRule(ruleId: Types.ObjectId, dto: {
        name?: string;
        description?: string;
        active?: boolean;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, OvertimeRule, {}, {}> & OvertimeRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, OvertimeRule, {}, {}> & OvertimeRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    approveOvertimeRule(ruleId: Types.ObjectId): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, OvertimeRule, {}, {}> & OvertimeRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, OvertimeRule, {}, {}> & OvertimeRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    toggleOvertimeRule(ruleId: Types.ObjectId, activate: boolean): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, OvertimeRule, {}, {}> & OvertimeRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, OvertimeRule, {}, {}> & OvertimeRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    listOvertimeRules(filter?: {
        active?: boolean;
    }): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, OvertimeRule, {}, {}> & OvertimeRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, OvertimeRule, {}, {}> & OvertimeRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    private validateLatenessRuleInput;
    createLatenessRule(dto: {
        name: string;
        description?: string;
        gracePeriodMinutes: number;
        deductionForEachMinute: number;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LatenessRule, {}, {}> & LatenessRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LatenessRule, {}, {}> & LatenessRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    updateLatenessRule(ruleId: Types.ObjectId, dto: {
        name?: string;
        description?: string;
        gracePeriodMinutes?: number;
        deductionForEachMinute?: number;
        active?: boolean;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LatenessRule, {}, {}> & LatenessRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LatenessRule, {}, {}> & LatenessRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    toggleLatenessRule(ruleId: Types.ObjectId, activate: boolean): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LatenessRule, {}, {}> & LatenessRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LatenessRule, {}, {}> & LatenessRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    listLatenessRules(filter?: {
        active?: boolean;
    }): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LatenessRule, {}, {}> & LatenessRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LatenessRule, {}, {}> & LatenessRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    private calculateMinutesLate;
    countLatenessExceptions(employeeId: Types.ObjectId, days: number): Promise<number>;
    handleRepeatedLateness(attendance: AttendanceRecordDocument, shiftStartTime: string): Promise<void>;
    getAttendanceRecordById(id: Types.ObjectId): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, AttendanceRecord, {}, {}> & AttendanceRecord & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, AttendanceRecord, {}, {}> & AttendanceRecord & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    submitAttendanceCorrectionRequest(dto: {
        employeeId: Types.ObjectId;
        attendanceRecordId: Types.ObjectId;
        reason: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, AttendanceCorrectionRequest, {}, {}> & AttendanceCorrectionRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, AttendanceCorrectionRequest, {}, {}> & AttendanceCorrectionRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getMyCorrectionRequests(employeeId: Types.ObjectId): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, AttendanceCorrectionRequest, {}, {}> & AttendanceCorrectionRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, AttendanceCorrectionRequest, {}, {}> & AttendanceCorrectionRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    reviewCorrectionRequest(requestId: Types.ObjectId, newStatus: CorrectionRequestStatus.APPROVED | CorrectionRequestStatus.REJECTED, reviewerId: Types.ObjectId): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, AttendanceCorrectionRequest, {}, {}> & AttendanceCorrectionRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, AttendanceCorrectionRequest, {}, {}> & AttendanceCorrectionRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    autoEscalateStaleCorrectionRequests(): Promise<void>;
    getPendingTimeExceptionsForReview(reviewerId: Types.ObjectId): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, TimeException, {}, {}> & TimeException & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, TimeException, {}, {}> & TimeException & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    reviewTimeException(exceptionId: Types.ObjectId, reviewerId: Types.ObjectId, newStatus: TimeExceptionStatus.APPROVED | TimeExceptionStatus.REJECTED, comment?: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, TimeException, {}, {}> & TimeException & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, TimeException, {}, {}> & TimeException & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getPendingCorrectionRequests(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, AttendanceCorrectionRequest, {}, {}> & AttendanceCorrectionRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, AttendanceCorrectionRequest, {}, {}> & AttendanceCorrectionRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    reviewCorrectionRequestWorkflow(requestId: Types.ObjectId, reviewerId: Types.ObjectId, newStatus: CorrectionRequestStatus.APPROVED | CorrectionRequestStatus.REJECTED): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, AttendanceCorrectionRequest, {}, {}> & AttendanceCorrectionRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, AttendanceCorrectionRequest, {}, {}> & AttendanceCorrectionRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    autoEscalateUnresolvedExceptions(): Promise<void>;
    autoEscalateStaleCorrectionRequestsForPayroll(): Promise<void>;
    private validatePermissionDuration;
    submitPermissionRequest(dto: {
        employeeId: Types.ObjectId;
        attendanceRecordId: Types.ObjectId;
        type: TimeExceptionType;
        minutesRequested: number;
        reason?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, TimeException, {}, {}> & TimeException & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, TimeException, {}, {}> & TimeException & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    reviewPermissionRequest(exceptionId: Types.ObjectId, reviewerId: Types.ObjectId, newStatus: TimeExceptionStatus.APPROVED | TimeExceptionStatus.REJECTED, comment?: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, TimeException, {}, {}> & TimeException & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, TimeException, {}, {}> & TimeException & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getApprovedPermissionsForPayroll(employeeId: Types.ObjectId, dateRange: {
        start: Date;
        end: Date;
    }): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, TimeException, {}, {}> & TimeException & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, TimeException, {}, {}> & TimeException & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    autoEscalatePendingPermissions(): Promise<void>;
    private fetchApprovedLeaves;
    private applyLeaveToAttendance;
    integrateVacationPackages(employeeId: Types.ObjectId, range: {
        start: Date;
        end: Date;
    }): Promise<{
        message: string;
        leaveDays?: undefined;
    } | {
        message: string;
        leaveDays: {
            date: string;
        }[];
    }>;
    createHoliday(dto: {
        type: HolidayType;
        startDate: Date;
        endDate?: Date;
        name?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Holiday, {}, {}> & Holiday & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Holiday, {}, {}> & Holiday & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    private getHolidaysForDate;
    private isHoliday;
    private applyHolidayRules;
    applyHolidayRange(employeeId: Types.ObjectId, range: {
        start: Date;
        end: Date;
    }): Promise<{
        message: string;
        totalDays: number;
    }>;
    private escalateCorrectionRequests;
    private escalateTimeExceptions;
    escalatePendingRequestsBeforePayroll(cutoffDate: Date): Promise<{
        message: string;
        correctionRequestsEscalated: number;
        timeExceptionsEscalated: number;
    }>;
    getOvertimeReport(range: {
        start: Date;
        end: Date;
    }): Promise<{
        employeeName: any;
        employeeEmail: any;
        totalWorkMinutes: number;
        hasMissedPunch: boolean;
        exceptionCount: number;
    }[]>;
    getExceptionReport(range: {
        start: Date;
        end: Date;
    }): Promise<{
        employeeName: any;
        employeeEmail: any;
        type: TimeExceptionType;
        status: TimeExceptionStatus;
        reason: string;
        attendanceRecordId: Types.ObjectId;
    }[]>;
    private exportToCsv;
    generateOvertimeReport(range: {
        start: Date;
        end: Date;
    }, exportAsCsv?: boolean): Promise<{
        employeeName: any;
        employeeEmail: any;
        totalWorkMinutes: number;
        hasMissedPunch: boolean;
        exceptionCount: number;
    }[] | {
        fileName: string;
        mimeType: string;
        content: any;
    }>;
    generateExceptionReport(range: {
        start: Date;
        end: Date;
    }, exportAsCsv?: boolean): Promise<{
        employeeName: any;
        employeeEmail: any;
        type: TimeExceptionType;
        status: TimeExceptionStatus;
        reason: string;
        attendanceRecordId: Types.ObjectId;
    }[] | {
        fileName: string;
        mimeType: string;
        content: any;
    }>;
    private fetchAttendanceForSync;
    private fetchTimeExceptionsForSync;
    private fetchCorrectionRequestsForSync;
    private buildSyncPayload;
    private syncToPayroll;
    private syncToLeaves;
    syncCrossModuleData(range: {
        start: Date;
        end: Date;
    }): Promise<{
        message: string;
        attendanceCount: number;
        exceptionCount: number;
        correctionRequestCount: number;
    }>;
}
