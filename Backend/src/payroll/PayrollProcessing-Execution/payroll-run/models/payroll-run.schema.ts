import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PayrollRunDocument = PayrollRun & Document;



export enum PayrollRunStatus {
  INITIATED = 'initiated',
  PROCESSING = 'processing',
  UNDER_REVIEW = 'review',
  APPROVAL_PENDING = 'approval_pending',
  FINANCE_REVIEW = 'finance_review',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class PayrollAnomaly {
  @Prop({ required: true })
  code: string;    // e.g. "missing_bank_info", "negative_net", etc.

  @Prop({ type: String })
  description: string; // Human-readable description

  @Prop({ type: Boolean, default: false })
  resolved: boolean;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employee_id: Types.ObjectId;
}


@Schema({ timestamps: true })
export class PayrollRun {

  @Prop({
  type: Types.ObjectId,
  ref: 'PayrollPeriod',
  required: true,
})
period_id: Types.ObjectId;


  @Prop({
    type: Types.ObjectId,
    ref:'Department',
    required: false,   // nullable → may run by department or whole company
    default: null,
  })
  department_id: Types.ObjectId| null;

  @Prop({ 
    required: true, 
    type: Types.ObjectId,
    ref:'EmployeeProfile'
})  
  initiated_by: Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(PayrollRunStatus),
    default: PayrollRunStatus.INITIATED,
  })
  status: PayrollRunStatus;

 @Prop({
  type: [
    {
      code: { type: String, required: true },
      description: { type: String },
      resolved: { type: Boolean, default: false },
      employee_id: { type: Types.ObjectId, ref: 'EmployeeProfile', required: true },
    },
  ],
  default: [],
})
anomalies: PayrollAnomaly[];

}
export const PayrollRunSchema = SchemaFactory.createForClass(PayrollRun);