import { Types } from 'mongoose';
export type PayrollReportDocument = PayrollReport & Document;
export declare enum PayrollReportType {
    DEPARTMENT_SUMMARY = "department_summary",
    MONTH_SUMMARY = "month_summary",
    YEAR_SUMMARY = "year_summary",
    TAX_INSURANCE_BENEFITS = "tax_insurance_benefits"
}
export declare class PayrollReport {
    type: PayrollReportType;
    period_start: Date;
    period_end: Date;
    department_id?: Types.ObjectId;
    generated_by: Types.ObjectId;
    data?: Record<string, any>;
}
export declare const PayrollReportSchema: import("mongoose").Schema<PayrollReport, import("mongoose").Model<PayrollReport, any, any, any, import("mongoose").Document<unknown, any, PayrollReport, any, {}> & PayrollReport & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PayrollReport, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<PayrollReport>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PayrollReport> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
