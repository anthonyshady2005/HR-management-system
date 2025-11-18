import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BonusPolicyDocument = HydratedDocument<BonusPolicy>;

export enum BonusPolicyStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  REJECTED = 'rejected',
}

@Schema()
export class BonusPolicy {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  conditions: string;

  @Prop({
    required: true,
    enum: BonusPolicyStatus,
    default: BonusPolicyStatus.DRAFT,
  })
  status: BonusPolicyStatus;
}

export const BonusPolicySchema = SchemaFactory.createForClass(BonusPolicy);
