import { Model, Types } from 'mongoose';
import { LeaveType, LeaveTypeDocument } from './models/leave-type.schema';
import { LeaveCategory, LeaveCategoryDocument } from './models/leave-category.schema';
import { LeaveRequest, LeaveRequestDocument } from './models/leave-request.schema';
import { LeavePolicy, LeavePolicyDocument } from './models/leave-policy.schema';
import { LeaveEntitlement, LeaveEntitlementDocument } from './models/leave-entitlement.schema';
import { LeaveAdjustment, LeaveAdjustmentDocument } from './models/leave-adjustment.schema';
import { Calendar, CalendarDocument } from './models/calendar.schema';
import { AttachmentDocument } from './models/attachment.schema';
import { PositionAssignmentDocument } from '../organization-structure/models/position-assignment.schema';
import { EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import { LeaveStatus } from './enums/leave-status.enum';
import { RoundingRule } from './enums/rounding-rule.enum';
export declare class LeavesService {
    private leaveTypeModel;
    private leaveCategoryModel;
    private leaveRequestModel;
    private leavePolicyModel;
    private leaveEntitlementModel;
    private leaveAdjustmentModel;
    private calendarModel;
    private attachmentModel;
    private employeeProfileModel;
    private positionAssignmentModel;
    private readonly logger;
    private delegationMap;
    constructor(leaveTypeModel: Model<LeaveTypeDocument>, leaveCategoryModel: Model<LeaveCategoryDocument>, leaveRequestModel: Model<LeaveRequestDocument>, leavePolicyModel: Model<LeavePolicyDocument>, leaveEntitlementModel: Model<LeaveEntitlementDocument>, leaveAdjustmentModel: Model<LeaveAdjustmentDocument>, calendarModel: Model<CalendarDocument>, attachmentModel: Model<AttachmentDocument>, employeeProfileModel: Model<EmployeeProfileDocument>, positionAssignmentModel: Model<PositionAssignmentDocument>);
    createLeaveCategory(data: {
        name: string;
        description?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveCategory, {}, {}> & LeaveCategory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveCategory, {}, {}> & LeaveCategory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getAllLeaveCategories(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveCategory, {}, {}> & LeaveCategory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveCategory, {}, {}> & LeaveCategory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getLeaveCategoryById(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveCategory, {}, {}> & LeaveCategory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveCategory, {}, {}> & LeaveCategory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    updateLeaveCategory(id: string, data: {
        name?: string;
        description?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveCategory, {}, {}> & LeaveCategory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveCategory, {}, {}> & LeaveCategory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    deleteLeaveCategory(id: string): Promise<{
        message: string;
        deletedCategory: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveCategory, {}, {}> & LeaveCategory & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveCategory, {}, {}> & LeaveCategory & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>;
    }>;
    createLeaveType(data: {
        code: string;
        name: string;
        categoryId: string;
        description?: string;
        paid?: boolean;
        deductible?: boolean;
        requiresAttachment?: boolean;
        attachmentType?: string;
        minTenureMonths?: number;
        maxDurationDays?: number;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveType, {}, {}> & LeaveType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveType, {}, {}> & LeaveType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getAllLeaveTypes(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveType, {}, {}> & LeaveType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveType, {}, {}> & LeaveType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getLeaveTypeById(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveType, {}, {}> & LeaveType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveType, {}, {}> & LeaveType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getLeaveTypeByCode(code: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveType, {}, {}> & LeaveType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveType, {}, {}> & LeaveType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    updateLeaveType(id: string, data: Partial<{
        code: string;
        name: string;
        categoryId: string;
        description: string;
        paid: boolean;
        deductible: boolean;
        requiresAttachment: boolean;
        attachmentType: string;
        minTenureMonths: number;
        maxDurationDays: number;
    }>): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveType, {}, {}> & LeaveType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveType, {}, {}> & LeaveType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    deleteLeaveType(id: string): Promise<{
        message: string;
        deletedLeaveType: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveType, {}, {}> & LeaveType & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveType, {}, {}> & LeaveType & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>;
    }>;
    createLeavePolicy(data: {
        leaveTypeId: string;
        accrualMethod?: string;
        monthlyRate?: number;
        yearlyRate?: number;
        carryForwardAllowed?: boolean;
        maxCarryForward?: number;
        expiryAfterMonths?: number;
        roundingRule?: string;
        minNoticeDays?: number;
        maxConsecutiveDays?: number;
        eligibility?: Record<string, any>;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeavePolicy, {}, {}> & LeavePolicy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeavePolicy, {}, {}> & LeavePolicy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getAllPolicies(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeavePolicy, {}, {}> & LeavePolicy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeavePolicy, {}, {}> & LeavePolicy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getLeavePolicyById(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeavePolicy, {}, {}> & LeavePolicy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeavePolicy, {}, {}> & LeavePolicy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getLeavePolicyByType(leaveTypeId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeavePolicy, {}, {}> & LeavePolicy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeavePolicy, {}, {}> & LeavePolicy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    updateLeavePolicy(id: string, data: Partial<{
        accrualMethod: string;
        monthlyRate: number;
        yearlyRate: number;
        carryForwardAllowed: boolean;
        maxCarryForward: number;
        expiryAfterMonths: number;
        roundingRule: string;
        minNoticeDays: number;
        maxConsecutiveDays: number;
        eligibility: Record<string, any>;
    }>): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeavePolicy, {}, {}> & LeavePolicy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeavePolicy, {}, {}> & LeavePolicy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    deleteLeavePolicy(id: string): Promise<{
        message: string;
        deletedPolicy: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeavePolicy, {}, {}> & LeavePolicy & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, LeavePolicy, {}, {}> & LeavePolicy & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>;
    }>;
    submitLeaveRequest(data: {
        employeeId: string;
        leaveTypeId: string;
        dates: {
            from: Date;
            to: Date;
        };
        durationDays: number;
        justification?: string;
        attachmentId?: string;
    }, delegations?: Map<string, string>): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveRequest, {}, {}> & LeaveRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveRequest, {}, {}> & LeaveRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getAllLeaveRequests(filters?: {
        employeeId?: string;
        leaveTypeId?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
        departmentId?: string;
        sortBy?: 'dates.from' | 'createdAt';
        sortOrder?: 'asc' | 'desc';
    }): Promise<any[]>;
    getLeaveRequestById(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveRequest, {}, {}> & LeaveRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveRequest, {}, {}> & LeaveRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    updateLeaveRequestStatus(id: string, data: {
        status: LeaveStatus;
        decidedBy?: string;
        role?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveRequest, {}, {}> & LeaveRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveRequest, {}, {}> & LeaveRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    cancelLeaveRequest(id: string, employeeId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveRequest, {}, {}> & LeaveRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveRequest, {}, {}> & LeaveRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    private getEmployeeDataForEligibility;
    private validateEmployeeEligibility;
    createEntitlement(data: {
        employeeId: string;
        leaveTypeId: string;
        yearlyEntitlement?: number;
        accruedActual?: number;
        accruedRounded?: number;
        carryForward?: number;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveEntitlement, {}, {}> & LeaveEntitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveEntitlement, {}, {}> & LeaveEntitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    createPersonalizedEntitlement(data: {
        employeeId: string;
        leaveTypeId: string;
        yearlyEntitlement?: number;
        accruedActual?: number;
        accruedRounded?: number;
        carryForward?: number;
        reason?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveEntitlement, {}, {}> & LeaveEntitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveEntitlement, {}, {}> & LeaveEntitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getEmployeeEntitlements(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveEntitlement, {}, {}> & LeaveEntitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveEntitlement, {}, {}> & LeaveEntitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getEntitlementById(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveEntitlement, {}, {}> & LeaveEntitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveEntitlement, {}, {}> & LeaveEntitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getBalanceSummary(employeeId: string, leaveTypeId: string): Promise<{
        leaveType: Types.ObjectId;
        yearlyEntitlement: number;
        carryForward: number;
        totalAvailable: number;
        taken: number;
        pending: number;
        accruedActual: number;
        accruedRounded: number;
        remaining: number;
        lastAccrualDate: Date | undefined;
        nextResetDate: Date | undefined;
    }>;
    updateBalance(id: string, data: {
        yearlyEntitlement?: number;
        accruedActual?: number;
        accruedRounded?: number;
        carryForward?: number;
        taken?: number;
        pending?: number;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveEntitlement, {}, {}> & LeaveEntitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveEntitlement, {}, {}> & LeaveEntitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    createAdjustment(data: {
        employeeId: string;
        leaveTypeId: string;
        adjustmentType: string;
        amount: number;
        reason: string;
        hrUserId: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveAdjustment, {}, {}> & LeaveAdjustment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveAdjustment, {}, {}> & LeaveAdjustment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getEmployeeAdjustments(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveAdjustment, {}, {}> & LeaveAdjustment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveAdjustment, {}, {}> & LeaveAdjustment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getAllAdjustments(filters?: {
        employeeId?: string;
        leaveTypeId?: string;
        adjustmentType?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveAdjustment, {}, {}> & LeaveAdjustment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveAdjustment, {}, {}> & LeaveAdjustment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    createCalendar(data: {
        year: number;
        holidays?: string[];
        blockedPeriods?: {
            from: Date;
            to: Date;
            reason: string;
        }[];
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Calendar, {}, {}> & Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Calendar, {}, {}> & Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getCalendarByYear(year: number): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Calendar, {}, {}> & Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Calendar, {}, {}> & Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    addBlockedPeriod(year: number, period: {
        from: Date;
        to: Date;
        reason: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Calendar, {}, {}> & Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Calendar, {}, {}> & Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    removeBlockedPeriod(year: number, periodIndex: number): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Calendar, {}, {}> & Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Calendar, {}, {}> & Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    isDateBlocked(date: Date): Promise<boolean>;
    checkBlockedPeriods(from: Date, to: Date): Promise<void>;
    addHolidayToCalendar(year: number, holidayId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Calendar, {}, {}> & Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Calendar, {}, {}> & Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    removeHolidayFromCalendar(year: number, holidayId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Calendar, {}, {}> & Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Calendar, {}, {}> & Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    checkOverlappingLeaves(employeeId: string, from: Date, to: Date, excludeRequestId?: string): Promise<void>;
    checkBalanceSufficiency(employeeId: string, leaveTypeId: string, requestedDays: number): Promise<{
        sufficient: boolean;
        paidDays: number;
        unpaidDays: number;
        requiresConversion: boolean;
    }>;
    validateRequiredDocuments(leaveTypeId: string, durationDays: number, attachmentId?: string): Promise<void>;
    getAttachmentForHr(attachmentId: string): Promise<AttachmentDocument | null>;
    calculateNetLeaveDays(employeeId: string, from: Date, to: Date): Promise<number>;
    getNetDaysCalculationDetails(employeeId: string, from: Date, to: Date): Promise<{
        totalDays: number;
        weekendsExcluded: number;
        holidaysExcluded: number;
        netDays: number;
        holidayDates: string[];
    }>;
    deductFromBalance(employeeId: string, leaveTypeId: string, days: number): Promise<void>;
    returnDaysToBalance(employeeId: string, leaveTypeId: string, days: number): Promise<void>;
    addToPendingBalance(employeeId: string, leaveTypeId: string, days: number): Promise<void>;
    delegateApproval(requestId: string, fromUserId: string, toUserId: string, role: string): Promise<void>;
    private resolveTeamMembers;
    getTeamBalances(managerId: string, options?: {
        leaveTypeId?: string;
        departmentId?: string;
    }): Promise<{
        employeeId: string;
        employeeName?: string;
        employeeNumber: string;
        balances: {
            leaveType: string;
            remaining: number;
            taken: number;
            pending: number;
            carryForward: number;
        }[];
    }[]>;
    getTeamUpcomingLeaves(managerId: string, options?: {
        leaveTypeId?: string;
        status?: LeaveStatus;
        startDate?: string;
        endDate?: string;
        departmentId?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        requestId: string;
        employeeId: any;
        employeeName: any;
        leaveType: any;
        from: Date;
        to: Date;
        durationDays: number;
        status: LeaveStatus;
    }[]>;
    flagIrregularPattern(requestId: string): Promise<void>;
    calculateEncashment(employeeId: string, leaveTypeId: string): Promise<{
        employeeId: string;
        leaveType: any;
        unusedDays: number;
        dailySalaryRate: number;
        encashmentAmount: number;
        formula: string;
    }>;
    processFinalSettlement(employeeId: string): Promise<never[]>;
    getAuditTrail(employeeId: string): Promise<{
        adjustmentId: Types.ObjectId;
        employeeId: Types.ObjectId;
        leaveType: any;
        adjustmentType: import("./enums/adjustment-type.enum").AdjustmentType;
        amount: number;
        reason: string;
        hrUserId: Types.ObjectId;
        hrUserName: any;
        createdAt: any;
    }[]>;
    updateLeaveRequest(id: string, data: {
        fromDate?: Date;
        toDate?: Date;
        durationDays?: number;
        justification?: string;
        attachmentId?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LeaveRequest, {}, {}> & LeaveRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, LeaveRequest, {}, {}> & LeaveRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    applyRounding(value: number, rule: RoundingRule): number;
    private getEmployeeHireDate;
    private getUnpaidDaysInPeriod;
    private calculateEligibleMonths;
    calculateAccrualForEmployee(employeeId: string, leaveTypeId: string, startDate: Date, endDate: Date): Promise<{
        actual: number;
        rounded: number;
    }>;
    runAccrualProcess(accrualType: 'monthly' | 'quarterly' | 'yearly'): Promise<{
        processed: number;
        failed: Array<{
            employeeId: string;
            error: string;
        }>;
    }>;
    calculateResetDate(employeeId: string): Promise<Date>;
    updateAllResetDates(): Promise<{
        updated: number;
        failed: Array<{
            employeeId: string;
            error: string;
        }>;
    }>;
    processCarryForwardForEmployee(employeeId: string, leaveTypeId: string): Promise<void>;
    runYearEndCarryForward(): Promise<{
        processed: number;
        capped: Array<{
            employeeId: string;
            leaveTypeId: string;
            original: number;
            capped: number;
        }>;
        failed: Array<{
            employeeId: string;
            error: string;
        }>;
    }>;
    private getEmployeeManagerId;
    determineApprover(employeeId: string, delegations?: Map<string, string>): Promise<string | null>;
    isUserAuthorizedToApprove(request: LeaveRequest, userId: string): Promise<boolean>;
    private escalateToNextLevel;
    escalateStaleApprovals(): Promise<{
        escalated: number;
        errors: string[];
    }>;
    hrOverrideRequest(requestId: string, decision: 'approve' | 'reject', justification: string, hrAdminId: string): Promise<LeaveRequest>;
    private checkCumulativeLimits;
    private getAllowedMimeTypes;
}
