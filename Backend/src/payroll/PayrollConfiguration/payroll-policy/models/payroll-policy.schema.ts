import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum PolicyType {
  Misconduct = 'Misconduct',
  Leaves = 'Leaves',
  Allowance = 'Allowance',
}

export enum Applicability {
  AllEmployees = 'All employees',
  FullTime = 'Full-time',
  PartTime = 'Part-time',
  Temporary = 'Temporary',
}

export enum PolicyStatus {
  Draft = 'draft',
  Active = 'active',
  Archived = 'rejected',
}

export type PayrollPolicyDocument = HydratedDocument<PayrollPolicy>;

@Schema()
export class PayrollPolicy {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: PolicyType })
  policyType: PolicyType;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  effectiveDate: Date;

  @Prop()
  lawReference?: string;

  @Prop({ type: [Number], required: true, min: 0, max: 100 })
  ruleDefinition: number[]; // [Percentage, Fixed amount, Threshold]

  @Prop({ required: true, enum: Applicability })
  applicability: Applicability;

  @Prop({ required: true, enum: PolicyStatus, default: PolicyStatus.Draft })
  status: PolicyStatus;
}

export const PayrollPolicySchema = SchemaFactory.createForClass(PayrollPolicy);
