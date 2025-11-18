import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AttendanceDocument = HydratedDocument<Attendance>;

@Schema({ timestamps: true })
export class Attendance {

  @Prop({ type: Types.ObjectId, auto: true })
  id: Types.ObjectId;                      // Unique identifier

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;              // Link to employee

  @Prop({ type: Date, required: true })
  date: Date;                              // Day of attendance

  @Prop({ type: Types.ObjectId, ref: 'ShiftAssignment', required: true })
  shiftAssignmentId: Types.ObjectId;       // Shift assignment reference

  @Prop({ type: Date })
  firstIn: Date;                           // Calculated earliest punch

  @Prop({ type: Date })
  lastOut: Date;                           // Calculated latest punch

  @Prop({ type: Number, default: 0 })
  totalWorkedMin: number;                  // Total worked minutes

  @Prop({ type: Number, default: 0 })
  lateMinutes: number;                     // Late arrival minutes

  @Prop({ type: Number, default: 0 })
  earlyLeaveMinutes: number;               // Early leave minutes

  @Prop({ type: Number, default: 0 })
  overtimeMinutes: number;                 // OT minutes

  @Prop({ type: Number, default: 0 })
  shortTimeMinutes: number;                // Short time minutes

  @Prop({ type: Boolean, default: false })
  missingPunch: boolean;                   // Missing punch flag

  @Prop({
    type: String,
    enum: ['None', 'FullDay', 'HalfDay', 'Leave', 'RestDay', 'Holiday'],
    default: 'None',
  })
  absenceType: string;                     // Type of absence

  @Prop({
    type: String,
    enum: ['Present', 'Absent', 'Leave', 'Invalid', 'PendingCorrection'],
    default: 'Present',
  })
  status: string;                          // Final attendance status

  @Prop()
  createdAt: Date;                         // Auto timestamp

  @Prop()
  updatedAt: Date;                         // Auto timestamp
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
