import { TimeManagementService } from './time-management.service';
import { ShiftCreateDTO } from './dto/shift-create.dto';
import { ShiftUpdateDTO } from './dto/shift-update.dto';
import { ShiftAssignmentCreateDTO } from './dto/shift-assignment-create.dto';
import { ShiftAssignmentUpdateDTO } from './dto/shift-assignment-update.dto';
import { ScheduleRuleCreateDTO } from './dto/schedule-rule-create.dto';
import { ScheduleRuleUpdateDTO } from './dto/schedule-rule-update.dto';
import { ShiftTypeCreateDTO } from './dto/shift-type-create.dto';
import { ShiftTypeUpdateDTO } from './dto/shift-type-update.dto';
import { Types } from 'mongoose';
import { CorrectionRequestStatus, TimeExceptionStatus } from './models/enums';
export declare class TimeManagementController {
    private readonly timeManagementService;
    constructor(timeManagementService: TimeManagementService);
    assignShiftToEmployee(dto: ShiftAssignmentCreateDTO): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/shift-assignment.schema").ShiftAssignment, {}, {}> & import("./models/shift-assignment.schema").ShiftAssignment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/shift-assignment.schema").ShiftAssignment, {}, {}> & import("./models/shift-assignment.schema").ShiftAssignment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    assignShiftToDepartment(departmentId: string, dto: ShiftAssignmentCreateDTO): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/shift-assignment.schema").ShiftAssignment, {}, {}> & import("./models/shift-assignment.schema").ShiftAssignment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/shift-assignment.schema").ShiftAssignment, {}, {}> & import("./models/shift-assignment.schema").ShiftAssignment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>, Omit<{
        employeeId: any;
        status: import("./models/enums").ShiftAssignmentStatus;
        departmentId?: Types.ObjectId;
        positionId?: Types.ObjectId;
        shiftId: Types.ObjectId;
        scheduleRuleId?: Types.ObjectId;
        startDate: Date;
        endDate?: Date;
    }, "_id">>[]>;
    assignShiftToPosition(positionId: string, dto: ShiftAssignmentCreateDTO): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/shift-assignment.schema").ShiftAssignment, {}, {}> & import("./models/shift-assignment.schema").ShiftAssignment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/shift-assignment.schema").ShiftAssignment, {}, {}> & import("./models/shift-assignment.schema").ShiftAssignment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>, Omit<{
        employeeId: any;
        status: import("./models/enums").ShiftAssignmentStatus;
        departmentId?: Types.ObjectId;
        positionId?: Types.ObjectId;
        shiftId: Types.ObjectId;
        scheduleRuleId?: Types.ObjectId;
        startDate: Date;
        endDate?: Date;
    }, "_id">>[]>;
    updateShiftAssignment(id: string, dto: ShiftAssignmentUpdateDTO): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/shift-assignment.schema").ShiftAssignment, {}, {}> & import("./models/shift-assignment.schema").ShiftAssignment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/shift-assignment.schema").ShiftAssignment, {}, {}> & import("./models/shift-assignment.schema").ShiftAssignment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    expireShiftAssignmentsAutomatically(): Promise<void>;
    createShiftType(dto: ShiftTypeCreateDTO): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/shift-type.schema").ShiftType, {}, {}> & import("./models/shift-type.schema").ShiftType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/shift-type.schema").ShiftType, {}, {}> & import("./models/shift-type.schema").ShiftType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getAllShiftTypes(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/shift-type.schema").ShiftType, {}, {}> & import("./models/shift-type.schema").ShiftType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/shift-type.schema").ShiftType, {}, {}> & import("./models/shift-type.schema").ShiftType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    updateShiftType(id: string, dto: ShiftTypeUpdateDTO): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/shift-type.schema").ShiftType, {}, {}> & import("./models/shift-type.schema").ShiftType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/shift-type.schema").ShiftType, {}, {}> & import("./models/shift-type.schema").ShiftType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    deactivateShiftType(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/shift-type.schema").ShiftType, {}, {}> & import("./models/shift-type.schema").ShiftType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/shift-type.schema").ShiftType, {}, {}> & import("./models/shift-type.schema").ShiftType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    createShift(dto: ShiftCreateDTO): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/shift.schema").Shift, {}, {}> & import("./models/shift.schema").Shift & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/shift.schema").Shift, {}, {}> & import("./models/shift.schema").Shift & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getAllShifts(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/shift.schema").Shift, {}, {}> & import("./models/shift.schema").Shift & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/shift.schema").Shift, {}, {}> & import("./models/shift.schema").Shift & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    updateShift(id: string, dto: ShiftUpdateDTO): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/shift.schema").Shift, {}, {}> & import("./models/shift.schema").Shift & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/shift.schema").Shift, {}, {}> & import("./models/shift.schema").Shift & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    deactivateShift(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/shift.schema").Shift, {}, {}> & import("./models/shift.schema").Shift & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/shift.schema").Shift, {}, {}> & import("./models/shift.schema").Shift & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    createScheduleRule(dto: ScheduleRuleCreateDTO): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/schedule-rule.schema").ScheduleRule, {}, {}> & import("./models/schedule-rule.schema").ScheduleRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/schedule-rule.schema").ScheduleRule, {}, {}> & import("./models/schedule-rule.schema").ScheduleRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getAllScheduleRules(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/schedule-rule.schema").ScheduleRule, {}, {}> & import("./models/schedule-rule.schema").ScheduleRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/schedule-rule.schema").ScheduleRule, {}, {}> & import("./models/schedule-rule.schema").ScheduleRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    updateScheduleRule(id: string, dto: ScheduleRuleUpdateDTO): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/schedule-rule.schema").ScheduleRule, {}, {}> & import("./models/schedule-rule.schema").ScheduleRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/schedule-rule.schema").ScheduleRule, {}, {}> & import("./models/schedule-rule.schema").ScheduleRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    deactivateScheduleRule(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/schedule-rule.schema").ScheduleRule, {}, {}> & import("./models/schedule-rule.schema").ScheduleRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/schedule-rule.schema").ScheduleRule, {}, {}> & import("./models/schedule-rule.schema").ScheduleRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    notifyUpcomingShiftExpiry(daysBefore?: string): Promise<{
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
    logPunchFromExternalSheet(input: any): Promise<import("mongoose").Document<unknown, {}, import("./models/attendance-record.schema").AttendanceRecord, {}, {}> & import("./models/attendance-record.schema").AttendanceRecord & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    clockIn(employeeIdentifier: string): Promise<import("mongoose").Document<unknown, {}, import("./models/attendance-record.schema").AttendanceRecord, {}, {}> & import("./models/attendance-record.schema").AttendanceRecord & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    clockOut(employeeIdentifier: string): Promise<import("mongoose").Document<unknown, {}, import("./models/attendance-record.schema").AttendanceRecord, {}, {}> & import("./models/attendance-record.schema").AttendanceRecord & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    correctAttendance(input: any): Promise<{
        message: string;
        attendanceRecord: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/attendance-record.schema").AttendanceRecord, {}, {}> & import("./models/attendance-record.schema").AttendanceRecord & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/attendance-record.schema").AttendanceRecord, {}, {}> & import("./models/attendance-record.schema").AttendanceRecord & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>;
        auditLog: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest, {}, {}> & import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest, {}, {}> & import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>;
    }>;
    syncAttendanceWithPayroll(): Promise<void>;
    createOvertimeRule(dto: any): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/overtime-rule.schema").OvertimeRule, {}, {}> & import("./models/overtime-rule.schema").OvertimeRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/overtime-rule.schema").OvertimeRule, {}, {}> & import("./models/overtime-rule.schema").OvertimeRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    updateOvertimeRule(ruleId: string, dto: any): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/overtime-rule.schema").OvertimeRule, {}, {}> & import("./models/overtime-rule.schema").OvertimeRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/overtime-rule.schema").OvertimeRule, {}, {}> & import("./models/overtime-rule.schema").OvertimeRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    approveOvertimeRule(ruleId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/overtime-rule.schema").OvertimeRule, {}, {}> & import("./models/overtime-rule.schema").OvertimeRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/overtime-rule.schema").OvertimeRule, {}, {}> & import("./models/overtime-rule.schema").OvertimeRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    toggleOvertimeRule(ruleId: string, activate: boolean): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/overtime-rule.schema").OvertimeRule, {}, {}> & import("./models/overtime-rule.schema").OvertimeRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/overtime-rule.schema").OvertimeRule, {}, {}> & import("./models/overtime-rule.schema").OvertimeRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    listOvertimeRules(filter: any): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/overtime-rule.schema").OvertimeRule, {}, {}> & import("./models/overtime-rule.schema").OvertimeRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/overtime-rule.schema").OvertimeRule, {}, {}> & import("./models/overtime-rule.schema").OvertimeRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    createLatenessRule(dto: any): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/lateness-rule.schema").LatenessRule, {}, {}> & import("./models/lateness-rule.schema").LatenessRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/lateness-rule.schema").LatenessRule, {}, {}> & import("./models/lateness-rule.schema").LatenessRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    updateLatenessRule(ruleId: string, dto: any): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/lateness-rule.schema").LatenessRule, {}, {}> & import("./models/lateness-rule.schema").LatenessRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/lateness-rule.schema").LatenessRule, {}, {}> & import("./models/lateness-rule.schema").LatenessRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    toggleLatenessRule(ruleId: string, activate: boolean): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/lateness-rule.schema").LatenessRule, {}, {}> & import("./models/lateness-rule.schema").LatenessRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/lateness-rule.schema").LatenessRule, {}, {}> & import("./models/lateness-rule.schema").LatenessRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    listLatenessRules(filter: any): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/lateness-rule.schema").LatenessRule, {}, {}> & import("./models/lateness-rule.schema").LatenessRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/lateness-rule.schema").LatenessRule, {}, {}> & import("./models/lateness-rule.schema").LatenessRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getRepeatedLatenessCount(employeeId: string, days?: string): Promise<number>;
    handleRepeatedLatenessManually(input: {
        attendanceRecordId: string;
        shiftStartTime: string;
    }): Promise<void>;
    submitAttendanceCorrectionRequest(dto: any): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest, {}, {}> & import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest, {}, {}> & import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getMyCorrectionRequests(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest, {}, {}> & import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest, {}, {}> & import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    reviewCorrectionRequest(requestId: string, dto: {
        status: CorrectionRequestStatus.APPROVED | CorrectionRequestStatus.REJECTED;
        reviewerId: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest, {}, {}> & import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest, {}, {}> & import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getPendingTimeExceptionsForReview(reviewerId: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/time-exception.schema").TimeException, {}, {}> & import("./models/time-exception.schema").TimeException & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/time-exception.schema").TimeException, {}, {}> & import("./models/time-exception.schema").TimeException & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    reviewTimeException(exceptionId: string, dto: {
        reviewerId: string;
        status: TimeExceptionStatus.APPROVED | TimeExceptionStatus.REJECTED;
        comment?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/time-exception.schema").TimeException, {}, {}> & import("./models/time-exception.schema").TimeException & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/time-exception.schema").TimeException, {}, {}> & import("./models/time-exception.schema").TimeException & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getPendingCorrectionRequests(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest, {}, {}> & import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest, {}, {}> & import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    reviewCorrectionRequestWorkflow(requestId: string, dto: {
        reviewerId: string;
        status: CorrectionRequestStatus.APPROVED | CorrectionRequestStatus.REJECTED;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest, {}, {}> & import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest, {}, {}> & import("./models/attendance-correction-request.schema").AttendanceCorrectionRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    autoEscalateUnresolvedExceptions(): Promise<void>;
    autoEscalateStaleCorrectionRequestsForPayroll(): Promise<void>;
    submitPermissionRequest(dto: any): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/time-exception.schema").TimeException, {}, {}> & import("./models/time-exception.schema").TimeException & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/time-exception.schema").TimeException, {}, {}> & import("./models/time-exception.schema").TimeException & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    reviewPermissionRequest(exceptionId: string, dto: {
        reviewerId: string;
        status: TimeExceptionStatus.APPROVED | TimeExceptionStatus.REJECTED;
        comment?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/time-exception.schema").TimeException, {}, {}> & import("./models/time-exception.schema").TimeException & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/time-exception.schema").TimeException, {}, {}> & import("./models/time-exception.schema").TimeException & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getApprovedPermissionsForPayroll(employeeId: string, start: string, end: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/time-exception.schema").TimeException, {}, {}> & import("./models/time-exception.schema").TimeException & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/time-exception.schema").TimeException, {}, {}> & import("./models/time-exception.schema").TimeException & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    autoEscalatePendingPermissions(): Promise<void>;
    integrateVacationPackages(employeeId: string, dto: {
        start: string;
        end: string;
    }): Promise<{
        message: string;
        leaveDays?: undefined;
    } | {
        message: string;
        leaveDays: {
            date: string;
        }[];
    }>;
    createHoliday(dto: any): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/holiday.schema").Holiday, {}, {}> & import("./models/holiday.schema").Holiday & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/holiday.schema").Holiday, {}, {}> & import("./models/holiday.schema").Holiday & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    applyHolidayRange(employeeId: string, dto: {
        start: string;
        end: string;
    }): Promise<{
        message: string;
        totalDays: number;
    }>;
    escalatePendingRequestsBeforePayroll(dto: {
        cutoff: string;
    }): Promise<{
        message: string;
        correctionRequestsEscalated: number;
        timeExceptionsEscalated: number;
    }>;
    generateOvertimeReport(start: string, end: string, exportCsv?: string): Promise<{
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
    generateExceptionReport(start: string, end: string, exportCsv?: string): Promise<{
        fileName: string;
        mimeType: string;
        content: any;
    } | {
        employeeName: any;
        employeeEmail: any;
        type: import("./models/enums").TimeExceptionType;
        status: TimeExceptionStatus;
        reason: string;
        attendanceRecordId: Types.ObjectId;
    }[]>;
    syncCrossModuleData(dto: {
        start: string;
        end: string;
    }): Promise<{
        message: string;
        attendanceCount: number;
        exceptionCount: number;
        correctionRequestCount: number;
    }>;
}
