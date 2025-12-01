import { Types } from 'mongoose';
import { LeavesService } from './leaves.service';
import { CreateLeaveCategoryDto } from './dto/create-leave-category.dto';
import { UpdateLeaveCategoryDto } from './dto/update-leave-category.dto';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';
import { UpdateLeavePolicyDto } from './dto/update-leave-policy.dto';
import { SubmitLeaveRequestDto } from './dto/submit-leave-request.dto';
import { UpdateLeaveRequestStatusDto } from './dto/update-leave-request-status.dto';
import { LeaveRequestQueryDto } from './dto/leave-request-query.dto';
import { HROverrideDto } from './dto/hr-override.dto';
import { CreateEntitlementDto } from './dto/create-entitlement.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { AdjustmentQueryDto } from './dto/adjustment-query.dto';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { AddBlockedPeriodDto } from './dto/add-blocked-period.dto';
import { DelegateApprovalDto } from './dto/delegate-approval.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { NetDaysCalculationDto } from './dto/net-days-calculation.dto';
import { LeaveStatus } from './enums/leave-status.enum';
import { AddHolidayDto } from './dto/add-holiday.dto';
export declare class LeavesController {
    private readonly leavesService;
    private delegations;
    constructor(leavesService: LeavesService);
    getAttachmentById(attachmentId: string): Promise<(import("mongoose").Document<unknown, {}, import("./models/attachment.schema").Attachment, {}, {}> & import("./models/attachment.schema").Attachment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    createLeaveCategory(dto: CreateLeaveCategoryDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-category.schema").LeaveCategory, {}, {}> & import("./models/leave-category.schema").LeaveCategory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-category.schema").LeaveCategory, {}, {}> & import("./models/leave-category.schema").LeaveCategory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getAllLeaveCategories(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-category.schema").LeaveCategory, {}, {}> & import("./models/leave-category.schema").LeaveCategory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-category.schema").LeaveCategory, {}, {}> & import("./models/leave-category.schema").LeaveCategory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getLeaveCategoryById(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-category.schema").LeaveCategory, {}, {}> & import("./models/leave-category.schema").LeaveCategory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-category.schema").LeaveCategory, {}, {}> & import("./models/leave-category.schema").LeaveCategory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    updateLeaveCategory(id: string, dto: UpdateLeaveCategoryDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-category.schema").LeaveCategory, {}, {}> & import("./models/leave-category.schema").LeaveCategory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-category.schema").LeaveCategory, {}, {}> & import("./models/leave-category.schema").LeaveCategory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    deleteLeaveCategory(id: string): Promise<{
        message: string;
        deletedCategory: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-category.schema").LeaveCategory, {}, {}> & import("./models/leave-category.schema").LeaveCategory & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-category.schema").LeaveCategory, {}, {}> & import("./models/leave-category.schema").LeaveCategory & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>;
    }>;
    createLeaveType(dto: CreateLeaveTypeDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-type.schema").LeaveType, {}, {}> & import("./models/leave-type.schema").LeaveType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-type.schema").LeaveType, {}, {}> & import("./models/leave-type.schema").LeaveType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getAllLeaveTypes(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-type.schema").LeaveType, {}, {}> & import("./models/leave-type.schema").LeaveType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-type.schema").LeaveType, {}, {}> & import("./models/leave-type.schema").LeaveType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getLeaveTypeById(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-type.schema").LeaveType, {}, {}> & import("./models/leave-type.schema").LeaveType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-type.schema").LeaveType, {}, {}> & import("./models/leave-type.schema").LeaveType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getLeaveTypeByCode(code: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-type.schema").LeaveType, {}, {}> & import("./models/leave-type.schema").LeaveType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-type.schema").LeaveType, {}, {}> & import("./models/leave-type.schema").LeaveType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    updateLeaveType(id: string, dto: UpdateLeaveTypeDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-type.schema").LeaveType, {}, {}> & import("./models/leave-type.schema").LeaveType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-type.schema").LeaveType, {}, {}> & import("./models/leave-type.schema").LeaveType & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    deleteLeaveType(id: string): Promise<{
        message: string;
        deletedLeaveType: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-type.schema").LeaveType, {}, {}> & import("./models/leave-type.schema").LeaveType & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-type.schema").LeaveType, {}, {}> & import("./models/leave-type.schema").LeaveType & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>;
    }>;
    createLeavePolicy(dto: CreateLeavePolicyDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-policy.schema").LeavePolicy, {}, {}> & import("./models/leave-policy.schema").LeavePolicy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-policy.schema").LeavePolicy, {}, {}> & import("./models/leave-policy.schema").LeavePolicy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getAllPolicies(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-policy.schema").LeavePolicy, {}, {}> & import("./models/leave-policy.schema").LeavePolicy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-policy.schema").LeavePolicy, {}, {}> & import("./models/leave-policy.schema").LeavePolicy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getLeavePolicyById(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-policy.schema").LeavePolicy, {}, {}> & import("./models/leave-policy.schema").LeavePolicy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-policy.schema").LeavePolicy, {}, {}> & import("./models/leave-policy.schema").LeavePolicy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getLeavePolicyByType(leaveTypeId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-policy.schema").LeavePolicy, {}, {}> & import("./models/leave-policy.schema").LeavePolicy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-policy.schema").LeavePolicy, {}, {}> & import("./models/leave-policy.schema").LeavePolicy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    updateLeavePolicy(id: string, dto: UpdateLeavePolicyDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-policy.schema").LeavePolicy, {}, {}> & import("./models/leave-policy.schema").LeavePolicy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-policy.schema").LeavePolicy, {}, {}> & import("./models/leave-policy.schema").LeavePolicy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    deleteLeavePolicy(id: string): Promise<{
        message: string;
        deletedPolicy: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-policy.schema").LeavePolicy, {}, {}> & import("./models/leave-policy.schema").LeavePolicy & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-policy.schema").LeavePolicy, {}, {}> & import("./models/leave-policy.schema").LeavePolicy & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>;
    }>;
    submitLeaveRequest(dto: SubmitLeaveRequestDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-request.schema").LeaveRequest, {}, {}> & import("./models/leave-request.schema").LeaveRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-request.schema").LeaveRequest, {}, {}> & import("./models/leave-request.schema").LeaveRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getAllLeaveRequests(query: LeaveRequestQueryDto): Promise<any[]>;
    getLeaveRequestById(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-request.schema").LeaveRequest, {}, {}> & import("./models/leave-request.schema").LeaveRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-request.schema").LeaveRequest, {}, {}> & import("./models/leave-request.schema").LeaveRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    updateLeaveRequestStatus(id: string, dto: UpdateLeaveRequestStatusDto, req: any): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-request.schema").LeaveRequest, {}, {}> & import("./models/leave-request.schema").LeaveRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-request.schema").LeaveRequest, {}, {}> & import("./models/leave-request.schema").LeaveRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    hrOverride(id: string, dto: HROverrideDto, req: any): Promise<import("./models/leave-request.schema").LeaveRequest>;
    cancelLeaveRequest(id: string, employeeId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-request.schema").LeaveRequest, {}, {}> & import("./models/leave-request.schema").LeaveRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-request.schema").LeaveRequest, {}, {}> & import("./models/leave-request.schema").LeaveRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    createEntitlement(dto: CreateEntitlementDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-entitlement.schema").LeaveEntitlement, {}, {}> & import("./models/leave-entitlement.schema").LeaveEntitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-entitlement.schema").LeaveEntitlement, {}, {}> & import("./models/leave-entitlement.schema").LeaveEntitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    createPersonalizedEntitlement(dto: CreateEntitlementDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-entitlement.schema").LeaveEntitlement, {}, {}> & import("./models/leave-entitlement.schema").LeaveEntitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-entitlement.schema").LeaveEntitlement, {}, {}> & import("./models/leave-entitlement.schema").LeaveEntitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getEmployeeEntitlements(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-entitlement.schema").LeaveEntitlement, {}, {}> & import("./models/leave-entitlement.schema").LeaveEntitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-entitlement.schema").LeaveEntitlement, {}, {}> & import("./models/leave-entitlement.schema").LeaveEntitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getEntitlementById(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-entitlement.schema").LeaveEntitlement, {}, {}> & import("./models/leave-entitlement.schema").LeaveEntitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-entitlement.schema").LeaveEntitlement, {}, {}> & import("./models/leave-entitlement.schema").LeaveEntitlement & {
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
    updateBalance(id: string, dto: UpdateBalanceDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-entitlement.schema").LeaveEntitlement, {}, {}> & import("./models/leave-entitlement.schema").LeaveEntitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-entitlement.schema").LeaveEntitlement, {}, {}> & import("./models/leave-entitlement.schema").LeaveEntitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    createAdjustment(dto: CreateAdjustmentDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-adjustment.schema").LeaveAdjustment, {}, {}> & import("./models/leave-adjustment.schema").LeaveAdjustment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-adjustment.schema").LeaveAdjustment, {}, {}> & import("./models/leave-adjustment.schema").LeaveAdjustment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getEmployeeAdjustments(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-adjustment.schema").LeaveAdjustment, {}, {}> & import("./models/leave-adjustment.schema").LeaveAdjustment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-adjustment.schema").LeaveAdjustment, {}, {}> & import("./models/leave-adjustment.schema").LeaveAdjustment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getAllAdjustments(query: AdjustmentQueryDto): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-adjustment.schema").LeaveAdjustment, {}, {}> & import("./models/leave-adjustment.schema").LeaveAdjustment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-adjustment.schema").LeaveAdjustment, {}, {}> & import("./models/leave-adjustment.schema").LeaveAdjustment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    createCalendar(createCalendarDto: CreateCalendarDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/calendar.schema").Calendar, {}, {}> & import("./models/calendar.schema").Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/calendar.schema").Calendar, {}, {}> & import("./models/calendar.schema").Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getCalendarByYear(year: number): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/calendar.schema").Calendar, {}, {}> & import("./models/calendar.schema").Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/calendar.schema").Calendar, {}, {}> & import("./models/calendar.schema").Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    addBlockedPeriod(year: number, addBlockedPeriodDto: AddBlockedPeriodDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/calendar.schema").Calendar, {}, {}> & import("./models/calendar.schema").Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/calendar.schema").Calendar, {}, {}> & import("./models/calendar.schema").Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    removeBlockedPeriod(year: number, index: number): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/calendar.schema").Calendar, {}, {}> & import("./models/calendar.schema").Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/calendar.schema").Calendar, {}, {}> & import("./models/calendar.schema").Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    addHolidayToCalendar(year: number, dto: AddHolidayDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/calendar.schema").Calendar, {}, {}> & import("./models/calendar.schema").Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/calendar.schema").Calendar, {}, {}> & import("./models/calendar.schema").Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    removeHolidayFromCalendar(year: number, holidayId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/calendar.schema").Calendar, {}, {}> & import("./models/calendar.schema").Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/calendar.schema").Calendar, {}, {}> & import("./models/calendar.schema").Calendar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    updateLeaveRequest(id: string, updateLeaveRequestDto: UpdateLeaveRequestDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/leave-request.schema").LeaveRequest, {}, {}> & import("./models/leave-request.schema").LeaveRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/leave-request.schema").LeaveRequest, {}, {}> & import("./models/leave-request.schema").LeaveRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    delegateApproval(id: string, delegateApprovalDto: DelegateApprovalDto): Promise<{
        message: string;
    }>;
    flagIrregularPattern(id: string): Promise<{
        message: string;
    }>;
    calculateNetDays(netDaysDto: NetDaysCalculationDto): Promise<{
        totalDays: number;
        weekendsExcluded: number;
        holidaysExcluded: number;
        netDays: number;
        holidayDates: string[];
    }>;
    checkIfDateBlocked(date: string): Promise<{
        date: string;
        isBlocked: boolean;
    }>;
    getTeamBalances(managerId: string, leaveTypeId?: string, departmentId?: string): Promise<{
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
    getTeamUpcomingLeaves(managerId: string, leaveTypeId?: string, status?: LeaveStatus, startDate?: string, endDate?: string, departmentId?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        requestId: string;
        employeeId: any;
        employeeName: any;
        leaveType: any;
        from: Date;
        to: Date;
        durationDays: number;
        status: LeaveStatus;
    }[]>;
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
    getIrregularPatterns(): Promise<any[]>;
    runMonthlyAccrual(): Promise<{
        message: string;
        processed: number;
        failed: {
            employeeId: string;
            error: string;
        }[];
    }>;
    runQuarterlyAccrual(): Promise<{
        message: string;
        processed: number;
        failed: {
            employeeId: string;
            error: string;
        }[];
    }>;
    runYearlyAccrual(): Promise<{
        message: string;
        processed: number;
        failed: {
            employeeId: string;
            error: string;
        }[];
    }>;
    runAccrualForEmployee(employeeId: string): Promise<{
        message: string;
        employeeId: string;
        results: ({
            leaveTypeId: Types.ObjectId;
            accrued: {
                actual: number;
                rounded: number;
            };
        } | {
            leaveTypeId: Types.ObjectId;
            error: string;
        })[];
    }>;
    runCarryForward(): Promise<{
        message: string;
        processed: number;
        capped: {
            employeeId: string;
            leaveTypeId: string;
            original: number;
            capped: number;
        }[];
        failed: {
            employeeId: string;
            error: string;
        }[];
    }>;
    calculateResetDates(): Promise<{
        message: string;
        updated: number;
        failed: {
            employeeId: string;
            error: string;
        }[];
    }>;
    checkBalance(employeeId: string, leaveTypeId: string, days: number): Promise<{
        message: string;
        available: boolean;
    }>;
    checkOverlap(employeeId: string, from: string, to: string): Promise<{
        message: string;
        hasOverlap: boolean;
    }>;
    validateDocuments(leaveTypeId: string, days: number, hasAttachment?: string): Promise<{
        message: string;
        documentsValid: boolean;
    }>;
}
