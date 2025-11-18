import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EmployeeChangeRequestDocument = EmployeeChangeRequest & Document;

export interface FieldChange {
  fieldName: string;
  oldValue: any;
  newValue: any;
}

@Schema({ timestamps: true })
export class EmployeeChangeRequest {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'EmployeeProfile',
  })
  employeeId: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'EmployeeProfile',
  })
  requestedBy: MongooseSchema.Types.ObjectId; // Employee ID who requested

  @Prop({ required: true, default: 'Pending' })
  status: 'Pending' | 'Approved' | 'Rejected';

  @Prop({
    required: true,
    type: [
      {
        fieldName: String,
        oldValue: MongooseSchema.Types.Mixed,
        newValue: MongooseSchema.Types.Mixed,
      },
    ],
  })
  fields: FieldChange[];

  @Prop({ required: true })
  reason: string;

  // HR review fields (HR manager handles this)
  @Prop()
  reviewedAt?: Date;

  @Prop()
  comment?: string;

  @Prop()
  decision?: 'Approved' | 'Rejected';
}

export const EmployeeChangeRequestSchema = SchemaFactory.createForClass(
  EmployeeChangeRequest,
);
