import { StreamableFile } from '@nestjs/common';
import { PayrollTrackingService } from './payroll-tracking.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateDisputeStatusDto } from './dto/update-dispute-status.dto';
import { ConfirmDisputeDto } from './dto/confirm-dispute.dto';
import { ConfirmClaimDto } from './dto/confirm-claim.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { UpdateClaimStatusDto } from './dto/update-claim-status.dto';
import { ReportPeriodDto, SummaryReportDto } from './dto/payroll-report.dto';
export declare class PayrollTrackingController {
    private readonly payrollTrackingService;
    constructor(payrollTrackingService: PayrollTrackingService);
    getMyPayslips(req: any): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../payroll-execution/models/payslip.schema").paySlip, {}, {}> & import("../payroll-execution/models/payslip.schema").paySlip & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("../payroll-execution/models/payslip.schema").paySlip, {}, {}> & import("../payroll-execution/models/payslip.schema").paySlip & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    getPayslipDetails(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../payroll-execution/models/payslip.schema").paySlip, {}, {}> & import("../payroll-execution/models/payslip.schema").paySlip & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("../payroll-execution/models/payslip.schema").paySlip, {}, {}> & import("../payroll-execution/models/payslip.schema").paySlip & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    downloadPayslip(payslipId: string, req: any): Promise<StreamableFile>;
    downloadTaxDocument(payslipId: string, req: any): Promise<StreamableFile>;
    getMySalaryHistory(req: any): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../payroll-execution/models/payslip.schema").paySlip, {}, {}> & import("../payroll-execution/models/payslip.schema").paySlip & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("../payroll-execution/models/payslip.schema").paySlip, {}, {}> & import("../payroll-execution/models/payslip.schema").paySlip & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    createDispute(createDisputeDto: CreateDisputeDto, req: any): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/disputes.schema").disputes, {}, {}> & import("./models/disputes.schema").disputes & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/disputes.schema").disputes, {}, {}> & import("./models/disputes.schema").disputes & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    getMyDisputes(req: any): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/disputes.schema").disputes, {}, {}> & import("./models/disputes.schema").disputes & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/disputes.schema").disputes, {}, {}> & import("./models/disputes.schema").disputes & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    getAllDisputes(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/disputes.schema").disputes, {}, {}> & import("./models/disputes.schema").disputes & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/disputes.schema").disputes, {}, {}> & import("./models/disputes.schema").disputes & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    getApprovedDisputes(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/disputes.schema").disputes, {}, {}> & import("./models/disputes.schema").disputes & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/disputes.schema").disputes, {}, {}> & import("./models/disputes.schema").disputes & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    confirmDispute(id: string, confirmDisputeDto: ConfirmDisputeDto, req: any): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/disputes.schema").disputes, {}, {}> & import("./models/disputes.schema").disputes & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/disputes.schema").disputes, {}, {}> & import("./models/disputes.schema").disputes & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | {
        message: string;
        dispute: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/disputes.schema").disputes, {}, {}> & import("./models/disputes.schema").disputes & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/disputes.schema").disputes, {}, {}> & import("./models/disputes.schema").disputes & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>;
    }>;
    getPendingManagerApprovalDisputes(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/disputes.schema").disputes, {}, {}> & import("./models/disputes.schema").disputes & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/disputes.schema").disputes, {}, {}> & import("./models/disputes.schema").disputes & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    updateDisputeStatus(id: string, updateDisputeStatusDto: UpdateDisputeStatusDto, req: any): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/disputes.schema").disputes, {}, {}> & import("./models/disputes.schema").disputes & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/disputes.schema").disputes, {}, {}> & import("./models/disputes.schema").disputes & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    createClaim(createClaimDto: CreateClaimDto, req: any): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/claims.schema").claims, {}, {}> & import("./models/claims.schema").claims & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/claims.schema").claims, {}, {}> & import("./models/claims.schema").claims & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    getMyClaims(req: any): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/claims.schema").claims, {}, {}> & import("./models/claims.schema").claims & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/claims.schema").claims, {}, {}> & import("./models/claims.schema").claims & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    getAllClaims(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/claims.schema").claims, {}, {}> & import("./models/claims.schema").claims & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/claims.schema").claims, {}, {}> & import("./models/claims.schema").claims & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    getApprovedClaims(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/claims.schema").claims, {}, {}> & import("./models/claims.schema").claims & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/claims.schema").claims, {}, {}> & import("./models/claims.schema").claims & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    confirmClaim(id: string, confirmClaimDto: ConfirmClaimDto, req: any): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/claims.schema").claims, {}, {}> & import("./models/claims.schema").claims & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/claims.schema").claims, {}, {}> & import("./models/claims.schema").claims & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | {
        message: string;
        claim: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/claims.schema").claims, {}, {}> & import("./models/claims.schema").claims & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/claims.schema").claims, {}, {}> & import("./models/claims.schema").claims & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>;
    }>;
    getPendingManagerApprovalClaims(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/claims.schema").claims, {}, {}> & import("./models/claims.schema").claims & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/claims.schema").claims, {}, {}> & import("./models/claims.schema").claims & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    updateClaimStatus(id: string, updateClaimStatusDto: UpdateClaimStatusDto, req: any): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/claims.schema").claims, {}, {}> & import("./models/claims.schema").claims & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/claims.schema").claims, {}, {}> & import("./models/claims.schema").claims & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    createRefundForDispute(id: string, createRefundDto: CreateRefundDto, req: any): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/refunds.schema").refunds, {}, {}> & import("./models/refunds.schema").refunds & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/refunds.schema").refunds, {}, {}> & import("./models/refunds.schema").refunds & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    createRefundForClaim(id: string, req: any): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./models/refunds.schema").refunds, {}, {}> & import("./models/refunds.schema").refunds & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./models/refunds.schema").refunds, {}, {}> & import("./models/refunds.schema").refunds & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
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
}
