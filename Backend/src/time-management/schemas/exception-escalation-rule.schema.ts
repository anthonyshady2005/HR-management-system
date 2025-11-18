// exception-escalation-rule.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ExceptionEscalationRuleDocument =
  HydratedDocument<ExceptionEscalationRule>;

@Schema({ timestamps: true })
export class ExceptionEscalationRule {
  @Prop({ type: Types.ObjectId, auto: true })
  id: Types.ObjectId; // Unique identifier

  @Prop({
    type: String,
    enum: ['correction', 'permission', 'overtime'],
    required: true,
  })
  exceptionType: string; // Type of exception

  @Prop({
    type: String,
    enum: ['line_manager', 'hr_admin'],
    required: true,
  })
  initialApproverRole: string; // First role to approve

  @Prop({ type: Number, required: true, min: 1 })
  maxPendingHours: number; // Hours before auto-escalation

  @Prop({
    type: String,
    enum: ['hr_admin', 'hr_manager'],
    required: true,
  })
  escalateToRole: string; // Next approver role

  @Prop({ type: Boolean, required: true, default: true })
  isActive: boolean; // Rule status

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  createdBy: Types.ObjectId; // Creator (HR/Admin)

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  updatedBy?: Types.ObjectId; // Last updater

  @Prop()
  createdAt: Date; // Auto timestamp

  @Prop()
  updatedAt: Date; // Auto timestamp
}

export const ExceptionEscalationRuleSchema = SchemaFactory.createForClass(
  ExceptionEscalationRule,
);

