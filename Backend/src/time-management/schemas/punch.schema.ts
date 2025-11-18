import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PunchDocument = HydratedDocument<Punch>;

@Schema({ timestamps: true })
export class Punch {

  @Prop({ type: Types.ObjectId, auto: true })
  punchId: Types.ObjectId;   // Unique identifier

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId; // Employee ID

  @Prop({
    type: String,
    enum: ['checkin', 'checkout'],
    required: true,
  })
  punchType: string;          // checkin / checkout

  @Prop({ type: Date, required: true })
  timestamp: Date;            // When the punch happened

  @Prop({
    type: String,
    enum: ['system', 'faceid', 'excel', 'mobile', 'manual'],
    default: 'system',
  })
  source: string;             // Punch source

  @Prop({ type: Boolean, default: true })
  isValid: boolean;           // Is the punch valid?

  @Prop({ type: String })
  validationReason: string;   // Accepted / failed reason

  @Prop({ type: Types.ObjectId, ref: 'ShiftAssignment' })
  shiftAssignmentId: Types.ObjectId; // Link to shift assignment

  @Prop({ type: String })
  notes: string;              // Extra info

  @Prop()
  createdAt: Date;            // Auto timestamp

  @Prop()
  updatedAt: Date;            // Auto timestamp
}

export const PunchSchema = SchemaFactory.createForClass(Punch);
