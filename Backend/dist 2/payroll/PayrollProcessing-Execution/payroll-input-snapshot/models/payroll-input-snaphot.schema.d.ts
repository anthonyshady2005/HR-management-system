import mongoose, { HydratedDocument } from 'mongoose';
export type PayrollInputSnapshotDocument = HydratedDocument<PayrollInputSnapshot>;
export declare class PayrollInputSnapshot {
    run_id: mongoose.Types.ObjectId;
    payslip: mongoose.Types.ObjectId;
}
export declare const PayrollInputSnapshotSchema: mongoose.Schema<PayrollInputSnapshot, mongoose.Model<PayrollInputSnapshot, any, any, any, mongoose.Document<unknown, any, PayrollInputSnapshot, any, {}> & PayrollInputSnapshot & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, PayrollInputSnapshot, mongoose.Document<unknown, {}, mongoose.FlatRecord<PayrollInputSnapshot>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<PayrollInputSnapshot> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
