// time-exception-request.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TimeExceptionRequestDocument =
  HydratedDocument<TimeExceptionRequest>;

@Schema({ timestamps: true })
export class TimeExceptionRequest {
  @Prop({ type: Types.ObjectId, auto: true })
  id: Types.ObjectId; // Unique identifier

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId; // FK → Employee

  @Prop({
    type: String,
    enum: ['correction', 'permission', 'overtime'],
    required: true,
  })
  exceptionType: string; // request type

  @Prop({ type: Types.ObjectId, ref: 'DailyAttendance' })
  attendanceRecordId?: Types.ObjectId; // optional FK → DailyAttendance

  @Prop({ type: Date, required: true })
  dateOfEvent: Date; // day of attendance issue

  @Prop({ type: String, required: true })
  originalValue: string; // what the system has

  @Prop({ type: String, required: true })
  requestedValue: string; // what the employee requests

  @Prop({ type: String, required: true })
  reason: string; // justification text

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected', 'escalated'],
    default: 'pending',
  })
  status: string; // request state

  @Prop({
    type: String,
    enum: ['manager', 'hr_admin', 'hr_manager', 'system'],
    default: 'manager',
    required: true,
  })
  currentApproverRole: string; // who should approve now

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  currentApproverId?: Types.ObjectId; // optional FK

  @Prop({ type: Date, required: true })
  deadlineAt: Date; // auto-escalation deadline

  @Prop({ type: Date })
  finalDecisionAt?: Date; // when approved/rejected
}

export const TimeExceptionRequestSchema =
  SchemaFactory.createForClass(TimeExceptionRequest);
