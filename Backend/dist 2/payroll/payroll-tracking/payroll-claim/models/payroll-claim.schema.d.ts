import { Document, Types } from 'mongoose';
export type PayrollClaimDocument = PayrollClaim & Document;
export declare enum PayrollClaimType {
    REIMBURSEMENT = "reimbursement",
    CORRECTION = "correction"
}
export declare enum PayrollClaimStatus {
    SUBMITTED = "submitted",
    APPROVED = "approved",
    REJECTED = "rejected",
    REFUNDED = "refunded"
}
export declare class PayrollClaim {
    employee_id: Types.ObjectId;
    type: PayrollClaimType;
    amount: number;
    reason: string;
    status: PayrollClaimStatus;
    approver_id?: Types.ObjectId;
    approved_at?: Date;
}
export declare const PayrollClaimSchema: import("mongoose").Schema<PayrollClaim, import("mongoose").Model<PayrollClaim, any, any, any, Document<unknown, any, PayrollClaim, any, {}> & PayrollClaim & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PayrollClaim, Document<unknown, {}, import("mongoose").FlatRecord<PayrollClaim>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PayrollClaim> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
