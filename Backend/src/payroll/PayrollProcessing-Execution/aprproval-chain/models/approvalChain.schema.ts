import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
//import { PayrollRunDocument } from '../../payroll-run/models/payroll-run.schema';
// import { EmployeeProfile, EmployeeProfileDocument } from '../../employee-profile/schemas/employee-profile.schema';

export type ApprovalChainDocument = HydratedDocument<ApprovalChain>;

export type EmployeeProfileDocument = HydratedDocument<any>
export type PayrollRunDocument = HydratedDocument<any>


@Schema({ timestamps: true })
export class ApprovalChain {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'PayrollRun', required: true })
  run_id: mongoose.Types.ObjectId | PayrollRunDocument;

  @Prop({
    required: true,
    enum: ['payroll_review', 'payroll_manager', 'finance']
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
    approver_id: string | EmployeeProfileDocument;

  @Prop()
  reason: string;

  @Prop()
  acted_at: Date;
}

export const ApprovalChainSchema =
  SchemaFactory.createForClass(ApprovalChain);
