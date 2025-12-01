import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PayTypeDocument = HydratedDocument<PayType>;

export enum PayTypeName {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CONTRACT_BASED = 'contract-based',
}

export enum PayTypeStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  REJECTED = 'rejected',
}

@Schema()
export class PayType {
  @Prop({ required: true, enum: PayTypeName })
  name: PayTypeName;

  @Prop({ required: true, enum: PayTypeStatus, default: PayTypeStatus.DRAFT })
  status: PayTypeStatus;
}

export const PayTypeSchema = SchemaFactory.createForClass(PayType);
