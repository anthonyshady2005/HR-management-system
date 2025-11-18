import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AllowanceDocument = HydratedDocument<Allowance>;

export enum AllowanceStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  REJECTED = 'rejected',
}

@Schema()
export class Allowance {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  conditions: string;

  @Prop({
    required: true,
    enum: AllowanceStatus,
    default: AllowanceStatus.DRAFT,
  })
  status: AllowanceStatus;

  @Prop({ required: true })
  effective_date: Date;
}

export const AllowanceSchema = SchemaFactory.createForClass(Allowance);
