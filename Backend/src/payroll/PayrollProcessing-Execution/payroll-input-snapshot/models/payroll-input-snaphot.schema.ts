import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
// import { PayrollRunDocument } from '../../payroll-run/models/payroll-run.schema';
// import { PayslipDocument } from '../../payslip/models/payslip.schema';

export type PayrollInputSnapshotDocument =
  HydratedDocument<PayrollInputSnapshot>;


export type PayrollRunDocument = HydratedDocument<any>
export type PayslipDocument = HydratedDocument<any>

@Schema({ timestamps: true })
export class PayrollInputSnapshot {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayrollRun',
    required: true,
  })
  run_id: mongoose.Types.ObjectId | PayrollRunDocument;

  

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Payslip' })
  payslip: mongoose.Types.ObjectId | PayslipDocument;
}

export const PayrollInputSnapshotSchema =
  SchemaFactory.createForClass(PayrollInputSnapshot);
