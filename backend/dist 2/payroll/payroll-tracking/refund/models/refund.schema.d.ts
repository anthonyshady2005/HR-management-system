import { Document, Types } from 'mongoose';
export type RefundDocument = Refund & Document;
export declare enum RefundStatus {
    SCHEDULED = "scheduled",
    APPLIED = "applied"
}
export declare class Refund {
    claim_id?: Types.ObjectId;
    dispute_id?: Types.ObjectId;
    amount: number;
    generated_by: Types.ObjectId;
    status: RefundStatus;
}
export declare const RefundSchema: import("mongoose").Schema<Refund, import("mongoose").Model<Refund, any, any, any, Document<unknown, any, Refund, any, {}> & Refund & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Refund, Document<unknown, {}, import("mongoose").FlatRecord<Refund>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Refund> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
