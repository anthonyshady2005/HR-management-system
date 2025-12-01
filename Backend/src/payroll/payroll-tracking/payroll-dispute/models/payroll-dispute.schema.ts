import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PayrollDisputeDocument = PayrollDispute & Document;

export enum PayrollDisputeIssue {
  WRONG_DEDUCTION = 'wrong_deduction',
  MISSING_ALLOWANCE = 'missing_allowance',
  INCORRECT_TAX = 'incorrect_tax',
  OVERPAYMENT = 'overpayment',
  UNPAID_OVERTIME = 'unpaid_overtime',
  INCORRECT_BENEFITS = 'incorrect_benefits',
  MISSING_TAX_RELIEF = 'missing_tax_relief',
  OTHER = 'other',
}

export enum PayrollDisputeStatus {
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RESOLVED = 'resolved',
}

@Schema({ timestamps: true })
export class PayrollDispute {
  @Prop({ type: Types.ObjectId, required: true, ref: 'EmployeeProfile' })
  public employee_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Payslip' })
  public payslip_id!: Types.ObjectId;

  @Prop({ type: String, enum: PayrollDisputeIssue, required: true })
  public issue!: PayrollDisputeIssue;

  @Prop({ type: String, trim: true, required: true })
  public details!: string;

  @Prop({
    type: String,
    enum: PayrollDisputeStatus,
    required: true,
    default: PayrollDisputeStatus.SUBMITTED,
  })
  public status!: PayrollDisputeStatus;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', default: null })
  public handler_user_id?: Types.ObjectId;

  @Prop({ type: String, trim: true, default: null })
  public decision_notes?: string;

  @Prop({ type: Date, default: null })
  public decided_at?: Date;
}

export const PayrollDisputeSchema =
  SchemaFactory.createForClass(PayrollDispute);
