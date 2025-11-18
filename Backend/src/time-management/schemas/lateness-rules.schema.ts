import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LatenessRuleDocument = HydratedDocument<LatenessRule>;

@Schema({ timestamps: true })
export class LatenessRule {
  @Prop({ type: String, required: true })
  ruleName: string;

  @Prop({ type: Number, required: true })
  thresholdMinutes: number;

  @Prop({ type: Number, required: true })
  gracePeriodMinutes: number;

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

  @Prop({
    type: String,
    enum: ['first_punch', 'arrival_only', 'any_punch', 'shift_start'],
    required: true,
  })
  appliesTo: string;

  @Prop({ type: Number, default: null })
  escalationThreshold: number | null;

  @Prop({
    type: String,
    enum: ['warning', 'suspension', 'termination', 'hr_review', 'none'],
    default: 'none',
  })
  escalationAction: string;

  @Prop({ type: Date, required: true })
  effectiveFrom: Date;

  @Prop({ type: Date, default: null })
  effectiveTo: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  updatedBy: Types.ObjectId;
}

export const LatenessRuleSchema = SchemaFactory.createForClass(LatenessRule);
