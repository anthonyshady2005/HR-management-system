import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PayslipDocument = Payslip & Document;

export enum EmploymentStatus {
  NORMAL = 'normal',
  NEW_HIRE = 'new_hire',
  RESIGNED = 'resigned',
  TERMINATED = 'terminated',
}

export enum PayslipStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  VIEWED = 'viewed',
}

@Schema({ _id: false })
export class BreakdownAllowance {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  amount: number;
}

@Schema({ _id: false })
export class BreakdownDeduction {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  amount: number;
}

@Schema({ _id: false })
export class PayslipBreakdown {
  @Prop({ required: true })
  base: number;

  @Prop({ type: [BreakdownAllowance], default: [] })
  allowances: BreakdownAllowance[];

  @Prop({ type: [BreakdownDeduction], default: [] })
  deductions: BreakdownDeduction[];
}

@Schema({ timestamps: true })
export class Payslip {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PayrollPeriod', required: true })
  periodId: Types.ObjectId;

  @Prop({
    enum: EmploymentStatus,
    required: true,
    default: EmploymentStatus.NORMAL,
  })
  employmentStatus: EmploymentStatus;

  @Prop({ required: true })
  base: number;

  @Prop({ type: [Number], default: [] })
  penalties: number[];

  @Prop({ default: 0 })
  overtime: number;

  @Prop({ default: 0 })
  leaveEncashment: number;

  @Prop({ required: true })
  gross: number;

  @Prop({ required: true })
  taxes: number;

  @Prop({ required: true })
  insurance: number;

  @Prop({ required: true })
  net: number;

  @Prop({ required: true })
  finalPaid: number;

  @Prop({ type: PayslipBreakdown, required: true })
  breakdown: PayslipBreakdown;

  @Prop({
    enum: PayslipStatus,
    required: true,
    default: PayslipStatus.DRAFT,
  })
  status: PayslipStatus;

  @Prop()
  publishedAt?: Date;
}

export const PayslipSchema = SchemaFactory.createForClass(Payslip);
