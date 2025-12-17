import { HydratedDocument } from 'mongoose';
export type PayTypeDocument = HydratedDocument<PayType>;
export declare enum PayTypeName {
    HOURLY = "hourly",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    CONTRACT_BASED = "contract-based"
}
export declare enum PayTypeStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    REJECTED = "rejected"
}
export declare class PayType {
    name: PayTypeName;
    status: PayTypeStatus;
}
export declare const PayTypeSchema: import("mongoose").Schema<PayType, import("mongoose").Model<PayType, any, any, any, import("mongoose").Document<unknown, any, PayType, any, {}> & PayType & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PayType, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<PayType>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PayType> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
