import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PayrollPayslipViewLogDocument = PayrollPayslipViewLog & Document;

@Schema({ timestamps: true })
export class PayrollPayslipViewLog {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Payslip' })
  public payslip_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'EmployeeProfile' })
  public employee_id!: Types.ObjectId;

  @Prop({ type: Date, required: true, default: Date.now })
  public viewed_at!: Date;

  @Prop({ type: Date, default: null })
  public downloaded_at?: Date;
}

export const PayrollPayslipViewLogSchema = SchemaFactory.createForClass(
  PayrollPayslipViewLog,
);
