import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WorkPolicyDocument = HydratedDocument<WorkPolicy>;

@Schema({ timestamps: true })
export class WorkPolicy {
  @Prop({
    type: String,
    enum: ['overtime', 'short_time', 'weekend'],
    required: true,
  })
  policyType: string;

  @Prop({ type: Number, required: true })
  thresholdHours: number;

  @Prop({ type: Number, required: true })
  rateMultiplier: number;

  @Prop({ type: Boolean, default: false })
  requiresApproval: boolean;

  @Prop({
    type: String,
    enum: ['manager', 'hr_admin', 'none'],
    default: 'none',
  })
  approvalRole: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date, required: true })
  effectiveFrom: Date;

  @Prop({ type: Date, default: null })
  effectiveUntil: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  updatedBy: Types.ObjectId;
}

export const WorkPolicySchema = SchemaFactory.createForClass(WorkPolicy);
