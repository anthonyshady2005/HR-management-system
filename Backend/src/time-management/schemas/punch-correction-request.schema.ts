import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PunchCorrectionRequestDocument = HydratedDocument<PunchCorrectionRequest>;

@Schema({ timestamps: true })
export class PunchCorrectionRequest {

  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;                          // Primary key

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;                   // Requester (employee)

  @Prop({ type: Date, required: true })
  date: Date;                                   // Day being corrected

  @Prop({ type: Date })
  requestedPunchIn: Date;                       // Proposed corrected IN

  @Prop({ type: Date })
  requestedPunchOut: Date;                      // Proposed corrected OUT

  @Prop({ type: String, required: true })
  reason: string;                               // Explanation by employee

  @Prop({
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Escalated'],
    default: 'Pending',
  })
  status: string;                               // Status of workflow

  @Prop({ type: Types.ObjectId, ref: 'User' })
  managerId: Types.ObjectId;                    // First approver

  @Prop({ type: Types.ObjectId, ref: 'User' })
  hrAdminId: Types.ObjectId;                    // Second approver (HR)

  @Prop({ type: String })
  resolutionNotes: string;                      // Notes from approvers

  @Prop()
  createdAt: Date;                              // Auto timestamp

  @Prop()
  updatedAt: Date;                              // Auto timestamp
}

export const PunchCorrectionRequestSchema =
  SchemaFactory.createForClass(PunchCorrectionRequest);
