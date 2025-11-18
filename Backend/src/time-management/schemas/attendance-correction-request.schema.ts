import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AttendanceCorrectionRequestDocument =
  HydratedDocument<AttendanceCorrectionRequest>;

@Schema({ timestamps: true })
export class AttendanceCorrectionRequest {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AttendanceRecord', required: true })
  attendanceRecordId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  dateOfIssue: Date;

  @Prop({
    type: String,
    enum: [
      'missing_punch',
      'wrong_punch',
      'lateness_dispute',
      'absence_dispute',
      'other',
    ],
    required: true,
  })
  issueType: string;

  @Prop({ type: String, required: true })
  originalValue: string;

  @Prop({ type: String, required: true })
  requestedValue: string;

  @Prop({ type: String, required: true })
  reason: string;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under_review'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  reviewedBy: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  reviewedAt: Date | null;

  @Prop({ type: String, default: null })
  reviewNote: string | null;
}

export const AttendanceCorrectionRequestSchema =
  SchemaFactory.createForClass(AttendanceCorrectionRequest);
