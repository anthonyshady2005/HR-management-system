import { Document } from 'mongoose';
export type PayrollPeriodDocument = PayrollPeriod & Document;
export declare enum PayrollPeriodStatus {
    PLANNED = "planned",
    OPEN = "open",
    UNDER_REVIEW = "under_review",
    WAITING_FINANCE = "waiting_finance",
    LOCKED = "locked",
    PAID = "paid",
    REOPENED = "reopened"
}
export declare class PayrollPeriod {
    month: number;
    year: number;
    status: PayrollPeriodStatus;
    opened_at: Date;
    closed_at: Date;
}
export declare const PayrollPeriodSchema: import("mongoose").Schema<PayrollPeriod, import("mongoose").Model<PayrollPeriod, any, any, any, Document<unknown, any, PayrollPeriod, any, {}> & PayrollPeriod & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PayrollPeriod, Document<unknown, {}, import("mongoose").FlatRecord<PayrollPeriod>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PayrollPeriod> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
