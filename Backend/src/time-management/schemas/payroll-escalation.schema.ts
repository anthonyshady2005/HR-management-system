// payroll-escalation.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PayrollEscalationDocument = HydratedDocument<PayrollEscalation>;

@Schema({ timestamps: true })
export class PayrollEscalation {
  @Prop({ type: Types.ObjectId, auto: true })
  id: Types.ObjectId; // Unique identifier

  @Prop({ type: Date, required: true })
  cutoffDate: Date; // Payroll cut-off date for this escalation cycle

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'TimeExceptionRequest' }],
    required: true,
  })
  pendingRequests: Types.ObjectId[]; // Unresolved exception requests

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  escalatedTo: Types.ObjectId; // HR Admin / Manager escalation target

  @Prop({
    type: String,
    enum: ['pending', 'escalated', 'resolved'],
    required: true,
    default: 'pending',
  })
  escalationStatus: string; // Current escalation state

  @Prop({ type: Date })
  escalationTimestamp?: Date; // When escalation was performed

  @Prop()
  createdAt: Date; // Auto timestamp

  @Prop()
  updatedAt: Date; // Auto timestamp
}

export const PayrollEscalationSchema =
  SchemaFactory.createForClass(PayrollEscalation);

// Optional index (NestJS-compatible)
PayrollEscalationSchema.index({ cutoffDate: 1, escalationStatus: 1 });
