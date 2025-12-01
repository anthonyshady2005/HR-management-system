import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type PayrollReportDocument = PayrollReport & Document;

export enum PayrollReportType {
  DEPARTMENT_SUMMARY = 'department_summary',
  MONTH_SUMMARY = 'month_summary',
  YEAR_SUMMARY = 'year_summary',
  TAX_INSURANCE_BENEFITS = 'tax_insurance_benefits',
}

@Schema({ timestamps: true })
export class PayrollReport {
  @Prop({ type: PayrollReportType, required: true })
  public type!: PayrollReportType;

  @Prop({ type: Date, required: true })
  public period_start!: Date;

  @Prop({ type: Date, required: true })
  public period_end!: Date;

  @Prop({ type: Types.ObjectId, ref: 'Department', default: null })
  public department_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'EmployeeProfile' })
  public generated_by!: Types.ObjectId;

  @Prop({ type: Object })
  public data?: Record<string, any>;
}

export const PayrollReportSchema = SchemaFactory.createForClass(PayrollReport);
