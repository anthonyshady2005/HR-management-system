import { HydratedDocument } from 'mongoose';
export type insuranceBracketDocument = HydratedDocument<insuranceBracket>;
export declare class insuranceBracket {
    insurance_type: string;
    salary_range_min: number;
    salary_range_max: number;
    employee_contribution_percentage: number;
    employer_contribution_percentage: number;
    status: string;
    notes?: string;
}
export declare const InsuranceBracketSchema: import("mongoose").Schema<insuranceBracket, import("mongoose").Model<insuranceBracket, any, any, any, import("mongoose").Document<unknown, any, insuranceBracket, any, {}> & insuranceBracket & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, insuranceBracket, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<insuranceBracket>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<insuranceBracket> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
