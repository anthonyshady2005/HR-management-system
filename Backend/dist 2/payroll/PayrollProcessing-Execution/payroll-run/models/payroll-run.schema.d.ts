import { Document, Types } from 'mongoose';
export type PayrollRunDocument = PayrollRun & Document;
export declare enum PayrollRunStatus {
    INITIATED = "initiated",
    PROCESSING = "processing",
    UNDER_REVIEW = "review",
    APPROVAL_PENDING = "approval_pending",
    FINANCE_REVIEW = "finance_review",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare class PayrollAnomaly {
    code: string;
    description: string;
    resolved: boolean;
    employee_id: Types.ObjectId;
}
export declare class PayrollRun {
    period_id: Types.ObjectId;
    department_id: Types.ObjectId | null;
    initiated_by: Types.ObjectId;
    status: PayrollRunStatus;
    anomalies: PayrollAnomaly[];
}
export declare const PayrollRunSchema: import("mongoose").Schema<PayrollRun, import("mongoose").Model<PayrollRun, any, any, any, Document<unknown, any, PayrollRun, any, {}> & PayrollRun & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PayrollRun, Document<unknown, {}, import("mongoose").FlatRecord<PayrollRun>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PayrollRun> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
