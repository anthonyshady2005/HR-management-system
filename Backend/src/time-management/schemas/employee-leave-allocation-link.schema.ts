// employee-leave-allocation-link.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EmployeeLeaveAllocationLinkDocument =
  HydratedDocument<EmployeeLeaveAllocationLink>;

@Schema({ timestamps: true })
export class EmployeeLeaveAllocationLink {
  @Prop({ type: Types.ObjectId, auto: true })
  id: Types.ObjectId; // Unique identifier

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId; // Employee receiving the leave allocation

  @Prop({ type: Types.ObjectId, ref: 'LeavePackage', required: true })
  vacationPackageId: Types.ObjectId; // Assigned leave/vacation package

  @Prop({ type: Types.ObjectId, ref: 'ShiftAssignment', required: true })
  shiftAssignmentId: Types.ObjectId; // Which shift assignment this applies to

  @Prop({ type: Types.ObjectId, ref: 'Holiday' })
  calendarId?: Types.ObjectId; // Optional link to merged holiday table

  @Prop({ type: Date, required: true })
  effectiveFrom: Date; // Activation date

  @Prop({ type: Date })
  effectiveTo?: Date; // Optional expiry date

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  createdBy: Types.ObjectId; // Creator (HR/Admin)

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  updatedBy?: Types.ObjectId; // Last updater

  @Prop()
  createdAt: Date; // Auto timestamp

  @Prop()
  updatedAt: Date; // Auto timestamp
}

export const EmployeeLeaveAllocationLinkSchema =
  SchemaFactory.createForClass(EmployeeLeaveAllocationLink);
