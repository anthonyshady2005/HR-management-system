import { Document, Types } from 'mongoose';
export type PayrollDisputeDocument = PayrollDispute & Document;
export declare enum PayrollDisputeIssue {
    WRONG_DEDUCTION = "wrong_deduction",
    MISSING_ALLOWANCE = "missing_allowance",
    INCORRECT_TAX = "incorrect_tax",
    OVERPAYMENT = "overpayment",
    UNPAID_OVERTIME = "unpaid_overtime",
    INCORRECT_BENEFITS = "incorrect_benefits",
    MISSING_TAX_RELIEF = "missing_tax_relief",
    OTHER = "other"
}
export declare enum PayrollDisputeStatus {
    SUBMITTED = "submitted",
    IN_REVIEW = "in_review",
    APPROVED = "approved",
    REJECTED = "rejected",
    RESOLVED = "resolved"
}
export declare class PayrollDispute {
    employee_id: Types.ObjectId;
    payslip_id: Types.ObjectId;
    issue: PayrollDisputeIssue;
    details: string;
    status: PayrollDisputeStatus;
    handler_user_id?: Types.ObjectId;
    decision_notes?: string;
    decided_at?: Date;
}
export declare const PayrollDisputeSchema: import("mongoose").Schema<PayrollDispute, import("mongoose").Model<PayrollDispute, any, any, any, Document<unknown, any, PayrollDispute, any, {}> & PayrollDispute & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PayrollDispute, Document<unknown, {}, import("mongoose").FlatRecord<PayrollDispute>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PayrollDispute> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
