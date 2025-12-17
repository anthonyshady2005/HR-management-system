import { Model, Types } from 'mongoose';
import { claims, claimsDocument } from './models/claims.schema';
import { disputes, disputesDocument } from './models/disputes.schema';
import { refunds, refundsDocument } from './models/refunds.schema';
import { paySlip, PayslipDocument } from '../payroll-execution/models/payslip.schema';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ConfirmDisputeDto } from './dto/confirm-dispute.dto';
import { ConfirmClaimDto } from './dto/confirm-claim.dto';
import { UpdateDisputeStatusDto } from './dto/update-dispute-status.dto';
import { UpdateClaimStatusDto } from './dto/update-claim-status.dto';
import { ReportPeriodDto, SummaryReportDto } from './dto/payroll-report.dto';
import { EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import { NotificationLogDocument } from '../time-management/models/notification-log.schema';
import { EmployeeSystemRoleDocument } from '../employee-profile/models/employee-system-role.schema';
export declare class PayrollTrackingService {
    private claimsModel;
    private disputesModel;
    private refundsModel;
    private paySlipModel;
    private employeeProfileModel;
    private notificationLogModel;
    private employeeSystemRoleModel;
    constructor(claimsModel: Model<claimsDocument>, disputesModel: Model<disputesDocument>, refundsModel: Model<refundsDocument>, paySlipModel: Model<PayslipDocument>, employeeProfileModel: Model<EmployeeProfileDocument>, notificationLogModel: Model<NotificationLogDocument>, employeeSystemRoleModel: Model<EmployeeSystemRoleDocument>);
    getEmployeePayslips(employeeId: Types.ObjectId): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, paySlip, {}, {}> & paySlip & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, paySlip, {}, {}> & paySlip & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getPayslipDetails(payslipId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, paySlip, {}, {}> & paySlip & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, paySlip, {}, {}> & paySlip & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getSalaryHistory(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, paySlip, {}, {}> & paySlip & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, paySlip, {}, {}> & paySlip & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    createDispute(createDisputeDto: CreateDisputeDto, employeeId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, disputes, {}, {}> & disputes & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, disputes, {}, {}> & disputes & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getDisputes(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, disputes, {}, {}> & disputes & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, disputes, {}, {}> & disputes & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getAllDisputes(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, disputes, {}, {}> & disputes & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, disputes, {}, {}> & disputes & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getApprovedDisputes(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, disputes, {}, {}> & disputes & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, disputes, {}, {}> & disputes & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getPendingManagerApprovalDisputes(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, disputes, {}, {}> & disputes & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, disputes, {}, {}> & disputes & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    confirmDispute(disputeId: string, confirmDisputeDto: ConfirmDisputeDto, managerId: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, disputes, {}, {}> & disputes & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, disputes, {}, {}> & disputes & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>) | {
        message: string;
        dispute: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, disputes, {}, {}> & disputes & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, disputes, {}, {}> & disputes & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>;
    }>;
    updateDisputeStatus(disputeId: string, updateDisputeStatusDto: UpdateDisputeStatusDto, staffId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, disputes, {}, {}> & disputes & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, disputes, {}, {}> & disputes & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    createClaim(createClaimDto: CreateClaimDto, employeeId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, claims, {}, {}> & claims & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, claims, {}, {}> & claims & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    getClaims(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, claims, {}, {}> & claims & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, claims, {}, {}> & claims & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getAllClaims(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, claims, {}, {}> & claims & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, claims, {}, {}> & claims & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getApprovedClaims(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, claims, {}, {}> & claims & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, claims, {}, {}> & claims & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getPendingManagerApprovalClaims(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, claims, {}, {}> & claims & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, claims, {}, {}> & claims & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    confirmClaim(claimId: string, confirmClaimDto: ConfirmClaimDto, managerId: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, claims, {}, {}> & claims & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, claims, {}, {}> & claims & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>) | {
        message: string;
        claim: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, claims, {}, {}> & claims & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, claims, {}, {}> & claims & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>;
    }>;
    updateClaimStatus(claimId: string, updateClaimStatusDto: UpdateClaimStatusDto, staffId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, claims, {}, {}> & claims & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, claims, {}, {}> & claims & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    createRefundForDispute(disputeId: string, amount: number, description: string, financeStaffId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, refunds, {}, {}> & refunds & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, refunds, {}, {}> & refunds & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    createRefundForClaim(claimId: string, financeStaffId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, refunds, {}, {}> & refunds & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, refunds, {}, {}> & refunds & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    generatePayslipPdf(payslipId: string): Promise<Buffer>;
    private buildPdfBuffer;
    generateTaxDocumentPdf(payslipId: string): Promise<Buffer>;
    private buildTaxPdfBuffer;
    getDepartmentPayrollReport(departmentId: string, query: ReportPeriodDto): Promise<any>;
    getPayrollSummary(query: SummaryReportDto): Promise<any>;
    getDeductionsBenefitsReport(query: ReportPeriodDto): Promise<{
        totalTaxes: number;
        totalInsurance: number;
        totalBenefits: number;
        period: {
            startDate: string;
            endDate: string;
        };
    }>;
    private notifyFinanceStaff;
}
