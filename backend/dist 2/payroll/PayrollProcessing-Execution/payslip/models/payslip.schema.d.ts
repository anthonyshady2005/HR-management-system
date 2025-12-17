import { Document, Types } from 'mongoose';
export type PayslipDocument = Payslip & Document;
export declare enum EmploymentStatus {
    NORMAL = "normal",
    NEW_HIRE = "new_hire",
    RESIGNED = "resigned",
    TERMINATED = "terminated"
}
export declare enum PayslipStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    VIEWED = "viewed"
}
export declare class BreakdownAllowance {
    name: string;
    amount: number;
}
export declare class BreakdownDeduction {
    name: string;
    amount: number;
}
export declare class PayslipBreakdown {
    base: number;
    allowances: BreakdownAllowance[];
    deductions: BreakdownDeduction[];
}
export declare class Payslip {
    employeeId: Types.ObjectId;
    periodId: Types.ObjectId;
    employmentStatus: EmploymentStatus;
    base: number;
    penalties: number[];
    overtime: number;
    leaveEncashment: number;
    gross: number;
    taxes: number;
    insurance: number;
    net: number;
    finalPaid: number;
    breakdown: PayslipBreakdown;
    status: PayslipStatus;
    publishedAt?: Date;
}
export declare const PayslipSchema: import("mongoose").Schema<Payslip, import("mongoose").Model<Payslip, any, any, any, Document<unknown, any, Payslip, any, {}> & Payslip & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Payslip, Document<unknown, {}, import("mongoose").FlatRecord<Payslip>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Payslip> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
