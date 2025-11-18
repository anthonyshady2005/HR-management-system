import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export enum TaxRuleStatus {
  Draft = 'draft',
  Active = 'active',
}

export type TaxRuleDocument = HydratedDocument<TaxRule>;

@Schema()
export class TaxRule {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  percentage: number;

  @Prop({ required: true, enum: TaxRuleStatus, default: TaxRuleStatus.Draft })
  status: TaxRuleStatus;
}

export const TaxRuleSchema = SchemaFactory.createForClass(TaxRule);
