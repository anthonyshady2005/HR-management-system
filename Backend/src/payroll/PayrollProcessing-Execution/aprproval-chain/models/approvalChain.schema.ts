import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ApprovalChainDocument = HydratedDocument<ApprovalChain>;

@Schema({ timestamps: true })
export class ApprovalChain {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayrollRun',
    required: true,
  })
  run_id: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    enum: ['payroll_review', 'payroll_manager', 'finance'],
  })
  stage: string;

  @Prop({
    enum: ['approved', 'rejected'],
  })
  status: string;

  @Prop({
    type: String,
    ref: 'EmployeeProfile',
    required: true,
  })
  approver_id: string;

  @Prop()
  reason: string;

  @Prop()
  acted_at: Date;
}

export const ApprovalChainSchema = SchemaFactory.createForClass(ApprovalChain);
