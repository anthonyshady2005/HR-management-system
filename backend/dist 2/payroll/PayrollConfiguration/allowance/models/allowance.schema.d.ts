import { HydratedDocument } from 'mongoose';
export type AllowanceDocument = HydratedDocument<Allowance>;
export declare enum AllowanceStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    REJECTED = "rejected"
}
export declare class Allowance {
    name: string;
    amount: number;
    conditions: string;
    status: AllowanceStatus;
    effective_date: Date;
}
export declare const AllowanceSchema: import("mongoose").Schema<Allowance, import("mongoose").Model<Allowance, any, any, any, import("mongoose").Document<unknown, any, Allowance, any, {}> & Allowance & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Allowance, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Allowance>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Allowance> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
