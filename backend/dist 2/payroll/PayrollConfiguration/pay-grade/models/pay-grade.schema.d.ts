import { HydratedDocument } from 'mongoose';
export type PayGradeDocument = HydratedDocument<PayGrade>;
export declare enum PayGradeStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    REJECTED = "rejected"
}
export declare class PayGrade {
    gradeCode: string;
    min_salary: number;
    max_salary: number;
    status: PayGradeStatus;
}
export declare const PayGradeSchema: import("mongoose").Schema<PayGrade, import("mongoose").Model<PayGrade, any, any, any, import("mongoose").Document<unknown, any, PayGrade, any, {}> & PayGrade & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PayGrade, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<PayGrade>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PayGrade> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
