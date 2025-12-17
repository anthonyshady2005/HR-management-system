import { HydratedDocument } from 'mongoose';
export type BonusPolicyDocument = HydratedDocument<BonusPolicy>;
export declare enum BonusPolicyStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    REJECTED = "rejected"
}
export declare class BonusPolicy {
    name: string;
    amount: number;
    conditions: string;
    status: BonusPolicyStatus;
}
export declare const BonusPolicySchema: import("mongoose").Schema<BonusPolicy, import("mongoose").Model<BonusPolicy, any, any, any, import("mongoose").Document<unknown, any, BonusPolicy, any, {}> & BonusPolicy & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, BonusPolicy, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<BonusPolicy>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<BonusPolicy> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
