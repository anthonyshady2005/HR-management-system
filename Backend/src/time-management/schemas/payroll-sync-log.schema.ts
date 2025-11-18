// payroll-sync-log.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PayrollSyncLogDocument = HydratedDocument<PayrollSyncLog>;

@Schema({ timestamps: true })
export class PayrollSyncLog {
  @Prop({ type: Types.ObjectId, auto: true })
  id: Types.ObjectId; // Unique identifier

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId; // FK → Employee

  @Prop({ type: Types.ObjectId, ref: 'DailyAttendance', required: true })
  attendanceRecordId: Types.ObjectId; // FK → DailyAttendance

  @Prop({ type: Date, required: true })
  date: Date; // Day being synced

  @Prop({ type: Number, required: true, default: 0, min: 0 })
  overtimeMinutes: number; // Calculated OT minutes

  @Prop({ type: Number, required: true, default: 0, min: 0 })
  lateMinutes: number; // Calculated late minutes

  @Prop({ type: Number, required: true, default: 0, min: 0 })
  shortTimeMinutes: number; // Short time minutes

  @Prop({ type: Number, required: true, default: 0, min: 0 })
  penaltyAmount: number; // Monetary penalty

  @Prop({
    type: String,
    enum: ['pending', 'synced', 'failed', 'retrying'],
    required: true,
    default: 'pending',
  })
  syncStatus: string; // Sync workflow state

  @Prop({ type: Number, required: true, default: 0, min: 0 })
  syncAttempts: number; // Retry count

  @Prop({ type: Date })
  syncTimestamp?: Date; // Last attempt time

  @Prop({ type: String, trim: true })
  errorMessage?: string; // Error details (if failed)

  @Prop()
  createdAt: Date; // From timestamps: true

  @Prop()
  updatedAt: Date; // From timestamps: true
}

export const PayrollSyncLogSchema =
  SchemaFactory.createForClass(PayrollSyncLog);

// Indexes translated to NestJS-compatible format
PayrollSyncLogSchema.index({ employeeId: 1, date: 1 });
PayrollSyncLogSchema.index({ syncStatus: 1, date: 1 });

