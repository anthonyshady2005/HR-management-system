import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Fix payroll dispute and finance staff reference

export type RefundDocument = Refund & Document;

export enum RefundStatus {
  SCHEDULED = 'scheduled',
  APPLIED = 'applied',
}

@Schema({ timestamps: true })
export class Refund {
  @Prop({ type: Types.ObjectId, ref: 'PayrollClaim', default: null })
  public claim_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PayrollDispute', default: null })
  public dispute_id?: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  public amount!: number;

  @Prop({ type: Types.ObjectId, required: true, ref: 'EmployeeProfile' })
  public generated_by!: Types.ObjectId;

  @Prop({ type: RefundStatus, required: true, default: RefundStatus.SCHEDULED })
  public status!: RefundStatus;
}

export const RefundSchema = SchemaFactory.createForClass(Refund);
