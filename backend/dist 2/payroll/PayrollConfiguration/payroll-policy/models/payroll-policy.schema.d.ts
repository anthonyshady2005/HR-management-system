import { HydratedDocument } from 'mongoose';
export declare enum PolicyType {
    Misconduct = "Misconduct",
    Leaves = "Leaves",
    Allowance = "Allowance"
}
export declare enum Applicability {
    AllEmployees = "All employees",
    FullTime = "Full-time",
    PartTime = "Part-time",
    Temporary = "Temporary"
}
export declare enum PolicyStatus {
    Draft = "draft",
    Active = "active",
    Archived = "rejected"
}
export type PayrollPolicyDocument = HydratedDocument<PayrollPolicy>;
export declare class PayrollPolicy {
    name: string;
    policyType: PolicyType;
    description: string;
    effectiveDate: Date;
    lawReference?: string;
    ruleDefinition: number[];
    applicability: Applicability;
    status: PolicyStatus;
}
export declare const PayrollPolicySchema: import("mongoose").Schema<PayrollPolicy, import("mongoose").Model<PayrollPolicy, any, any, any, import("mongoose").Document<unknown, any, PayrollPolicy, any, {}> & PayrollPolicy & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PayrollPolicy, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<PayrollPolicy>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PayrollPolicy> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
