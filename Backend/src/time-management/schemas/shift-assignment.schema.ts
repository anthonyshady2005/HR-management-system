import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ShiftAssignmentDocument = HydratedDocument<ShiftAssignment>;

@Schema({ timestamps: true })
export class ShiftAssignment {

  @Prop({ type: Types.ObjectId, auto: true })
  id: Types.ObjectId;  // Unique identifier

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: false })
  employeeId: Types.ObjectId;   // Single employee

  @Prop({ type: Types.ObjectId, ref: 'Department', required: false })
  departmentId: Types.ObjectId; // Optional

  @Prop({ type: Types.ObjectId, ref: 'Position', required: false })
  positionId: Types.ObjectId;   // Optional

  @Prop({ type: Types.ObjectId, ref: 'ShiftType', required: true })
  shiftId: Types.ObjectId;      // Link to ShiftType

  @Prop({
    type: String,
    enum: ['Individual', 'Department', 'Position'],
    required: true,
  })
  assignmentType: string;        // How the shift is assigned

  @Prop({ type: Date, required: true })
  startDate: Date;               // When shift begins

  @Prop({ type: Date })
  endDate: Date;                 // Optional duration or testing period

  @Prop({ type: Boolean, default: true })
  isActive: boolean;             // In active duration and valid

  @Prop({ type: Boolean, default: false })
  isExpired: boolean;            // True when past endDate

  @Prop({ type: Number, required: true })
  createdBy: number;             // Admin who created

  @Prop({ type: Number, required: true })
  updatedBy: number;             // Admin who last updated

  @Prop()
  createdAt: Date;               // Auto timestamp from @Schema

  @Prop()
  updatedAt: Date;               // Auto timestamp from @Schema
}

export const ShiftAssignmentSchema =
  SchemaFactory.createForClass(ShiftAssignment);
