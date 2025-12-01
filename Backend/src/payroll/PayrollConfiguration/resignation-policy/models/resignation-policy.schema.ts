import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ResignationPolicyDocument = HydratedDocument<ResignationPolicy>;

export enum TerminationType {
  RESIGNATION = 'resignation',
  TERMINATION = 'termination',
}

export enum ResignationPolicyStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Schema()
export class ResignationPolicy {
  @Prop({ required: true, enum: TerminationType })
  termination_type: TerminationType;

  @Prop({ required: true })
  compensation_amount: number;

  @Prop({ required: true })
  benefits: string;

  @Prop({ required: true })
  conditions: string;

  @Prop({
    required: true,
    enum: ResignationPolicyStatus,
    default: ResignationPolicyStatus.DRAFT,
  })
  status: ResignationPolicyStatus;
}

export const ResignationPolicySchema =
  SchemaFactory.createForClass(ResignationPolicy);
