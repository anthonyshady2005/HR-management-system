import { Document, Types } from 'mongoose';
export type PayrollPayslipViewLogDocument = PayrollPayslipViewLog & Document;
export declare class PayrollPayslipViewLog {
    payslip_id: Types.ObjectId;
    employee_id: Types.ObjectId;
    viewed_at: Date;
    downloaded_at?: Date;
}
export declare const PayrollPayslipViewLogSchema: import("mongoose").Schema<PayrollPayslipViewLog, import("mongoose").Model<PayrollPayslipViewLog, any, any, any, Document<unknown, any, PayrollPayslipViewLog, any, {}> & PayrollPayslipViewLog & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PayrollPayslipViewLog, Document<unknown, {}, import("mongoose").FlatRecord<PayrollPayslipViewLog>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PayrollPayslipViewLog> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
