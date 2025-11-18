import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AppraisalDisputeDocument = HydratedDocument<AppraisalDispute>;

export enum DisputeStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  DENIED = 'denied',
}

@Schema({ timestamps: true })
export class AppraisalDispute {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AppraisalRating', required: true })
  ratingId: Types.ObjectId;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true, enum: DisputeStatus })
  status: DisputeStatus;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile' })
  resolvedBy?: Types.ObjectId;

  @Prop()
  resolutionComment?: string;
}

export const AppraisalDisputeSchema = SchemaFactory.createForClass(AppraisalDispute);
