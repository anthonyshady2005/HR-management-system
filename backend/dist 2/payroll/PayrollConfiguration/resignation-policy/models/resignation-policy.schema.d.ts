import { HydratedDocument } from 'mongoose';
export type ResignationPolicyDocument = HydratedDocument<ResignationPolicy>;
export declare enum TerminationType {
    RESIGNATION = "resignation",
    TERMINATION = "termination"
}
export declare enum ResignationPolicyStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    ARCHIVED = "archived"
}
export declare class ResignationPolicy {
    termination_type: TerminationType;
    compensation_amount: number;
    benefits: string;
    conditions: string;
    status: ResignationPolicyStatus;
}
export declare const ResignationPolicySchema: import("mongoose").Schema<ResignationPolicy, import("mongoose").Model<ResignationPolicy, any, any, any, import("mongoose").Document<unknown, any, ResignationPolicy, any, {}> & ResignationPolicy & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ResignationPolicy, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ResignationPolicy>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ResignationPolicy> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
