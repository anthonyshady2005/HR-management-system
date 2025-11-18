import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EmployeeAppraisalHistoryDocument = HydratedDocument<EmployeeAppraisalHistory>;

@Schema({ timestamps: true })
export class EmployeeAppraisalHistory {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AppraisalCycle', required: true })
  cycleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AppraisalTemplate', required: true })
  templateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AppraisalRating', required: true })
  ratingId: Types.ObjectId;

  @Prop({ required: true })
  finalScore: number;

  @Prop({ type: Object, required: true })
  ratingScaleUsed: any;

  @Prop({ required: true })
  appraisalDate: Date;

  @Prop({ required: true, enum: ['manager-assessment', 'self-assessment'] })
  method: string;
}

export const EmployeeAppraisalHistorySchema = SchemaFactory.createForClass(EmployeeAppraisalHistory);
