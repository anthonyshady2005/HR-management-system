import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ManualCorrectionLogDocument = HydratedDocument<ManualCorrectionLog>;

@Schema({ timestamps: true })
export class ManualCorrectionLog {

  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;                   // Primary key

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;            // Employee who was corrected

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  managerId: Types.ObjectId;             // Manager who performed correction

  @Prop({ type: Types.ObjectId, ref: 'Punch', required: false })
  oldPunchId: Types.ObjectId;            // Old punch reference

  @Prop({ type: Types.ObjectId, ref: 'Punch', required: true })
  newPunchId: Types.ObjectId;            // New corrected punch

  @Prop({ type: String, required: true })
  reason: string;                        // Why correction happened

  @Prop()
  createdAt: Date;                       // Auto timestamp from @Schema
}

export const ManualCorrectionLogSchema =
  SchemaFactory.createForClass(ManualCorrectionLog);
