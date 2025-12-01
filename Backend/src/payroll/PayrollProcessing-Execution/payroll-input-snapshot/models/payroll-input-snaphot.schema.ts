import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PayrollInputSnapshotDocument =
  HydratedDocument<PayrollInputSnapshot>;



@Schema({ timestamps: true })
export class PayrollInputSnapshot {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayrollRun',
    required: true,
  })
  run_id: mongoose.Types.ObjectId ;

  

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Payslip' })
  payslip: mongoose.Types.ObjectId;
}

export const PayrollInputSnapshotSchema =
  SchemaFactory.createForClass(PayrollInputSnapshot);
