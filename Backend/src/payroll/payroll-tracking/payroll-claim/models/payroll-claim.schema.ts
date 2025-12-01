import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PayrollClaimDocument = PayrollClaim & Document;

export enum PayrollClaimType {
  REIMBURSEMENT = 'reimbursement',
  CORRECTION = 'correction',
}
export enum PayrollClaimStatus {
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class PayrollClaim {
  @Prop({ type: Types.ObjectId, required: true, ref: 'EmployeeProfile' })
  public employee_id!: Types.ObjectId;

  @Prop({ type: PayrollClaimType, required: true })
  public type!: PayrollClaimType;

  @Prop({ required: true, min: 0 })
  public amount!: number;

  @Prop({ required: true, trim: true })
  public reason!: string;

  @Prop({
    type: PayrollClaimStatus,
    required: true,
    default: PayrollClaimStatus.SUBMITTED,
  })
  public status!: PayrollClaimStatus;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', default: null })
  public approver_id?: Types.ObjectId;

  @Prop({ type: Date, default: null })
  public approved_at?: Date;
}

export const PayrollClaimSchema = SchemaFactory.createForClass(PayrollClaim);
