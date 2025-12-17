import { HydratedDocument } from 'mongoose';
export type ChangeWorkflowRuleDocument = HydratedDocument<ChangeWorkflowRule>;
export declare class ChangeWorkflowRule {
    fieldNames: string[];
    autoApprove: boolean;
    requiredApproverRoles: string[];
}
export declare const ChangeWorkflowRuleSchema: import("mongoose").Schema<ChangeWorkflowRule, import("mongoose").Model<ChangeWorkflowRule, any, any, any, import("mongoose").Document<unknown, any, ChangeWorkflowRule, any, {}> & ChangeWorkflowRule & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ChangeWorkflowRule, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ChangeWorkflowRule>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ChangeWorkflowRule> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
