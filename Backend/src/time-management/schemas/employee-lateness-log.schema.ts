import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EmployeeLatenessLogDocument = HydratedDocument<EmployeeLatenessLog>;

@Schema({ timestamps: true })
export class EmployeeLatenessLog {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: Number, required: true })
  minutesLate: number;

  @Prop({ type: Boolean, default: false })
  penaltyApplied: boolean;

  @Prop({
    type: String,
    enum: ['deduction', 'warning', 'none'],
    required: true,
  })
  penaltyType: string;

  @Prop({
    type: String,
    enum: ['amount', 'percentage', null],
    default: null,
  })
  penaltyTypeValue: string | null;

  @Prop({ type: Number, default: null })
  penaltyAmount: number | null;

  @Prop({ type: Number, default: null })
  penaltyPercentage: number | null;

  @Prop({ type: Types.ObjectId, ref: 'LatenessRule', required: true })
  ruleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  recordedBy: Types.ObjectId;
}

export const EmployeeLatenessLogSchema =
  SchemaFactory.createForClass(EmployeeLatenessLog);
