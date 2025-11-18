// time-exception-approval-log.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TimeExceptionApprovalLogDocument =
  HydratedDocument<TimeExceptionApprovalLog>;

@Schema({ timestamps: false }) // we rely on actionAt instead
export class TimeExceptionApprovalLog {
  @Prop({ type: Types.ObjectId, auto: true })
  id: Types.ObjectId; // Unique identifier

  @Prop({ type: Types.ObjectId, ref: 'TimeExceptionRequest', required: true })
  exceptionId: Types.ObjectId; // FK → TimeExceptionRequest

  @Prop({
    type: String,
    enum: ['submitted', 'approved', 'rejected', 'escalated', 'auto_escalated'],
    required: true,
  })
  action: string; // Action taken

  @Prop({
    type: String,
    enum: ['employee', 'line_manager', 'hr_admin', 'system'],
    required: true,
  })
  actorRole: string; // Who performed the action

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  actorId?: Types.ObjectId; // FK → Employee/User (nullable for system actions)

  @Prop({ type: Date, required: true })
  actionAt: Date; // Exact timestamp of event

  @Prop({ type: String, trim: true })
  comment?: string; // Optional notes
}

export const TimeExceptionApprovalLogSchema =
  SchemaFactory.createForClass(TimeExceptionApprovalLog);
