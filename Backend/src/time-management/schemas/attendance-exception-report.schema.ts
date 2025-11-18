// attendance-exception-report.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AttendanceExceptionReportDocument =
  HydratedDocument<AttendanceExceptionReport>;

@Schema({ timestamps: true })
export class AttendanceExceptionReport {
  @Prop({ type: Types.ObjectId, auto: true })
  id: Types.ObjectId; // Unique identifier

  @Prop({
    type: String,
    enum: ['overtime', 'exceptions', 'penalties', 'summary'],
    required: true,
  })
  reportType: string; // "overtime" | "exceptions" | "penalties" | "summary"

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  generatedBy: Types.ObjectId; // HR/Payroll officer who generated the report

  @Prop({ type: Date, required: true })
  dateRangeStart: Date; // Start of the report period

  @Prop({ type: Date, required: true })
  dateRangeEnd: Date; // End of the report period

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId?: Types.ObjectId; // Optional department filter

  @Prop()
  createdAt: Date; // Auto timestamp from @Schema({ timestamps: true })

  @Prop()
  updatedAt: Date; // Auto timestamp from @Schema({ timestamps: true })
}

export const AttendanceExceptionReportSchema = SchemaFactory.createForClass(
  AttendanceExceptionReport,
);

