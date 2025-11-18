import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PayrollPeriodDocument = PayrollPeriod & Document;

export enum PayrollPeriodStatus {
  PLANNED = 'planned',
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  WAITING_FINANCE = 'waiting_finance',
  LOCKED = 'locked',
  PAID = 'paid',
  REOPENED = 'reopened',
}

@Schema({ timestamps: true })
export class PayrollPeriod {

  @Prop({
     required: true,
     min:1,
     max:12
    })
  month: number;

  @Prop({ required: true,
    min:1000
   })
  year: number;


  @Prop({
    required: true,
    enum: Object.values(PayrollPeriodStatus),
    default: PayrollPeriodStatus.PLANNED,
  })
  status: PayrollPeriodStatus;

  @Prop({ required: true })
  opened_at: Date;

  @Prop({ required: true })
  closed_at: Date;
}

export const PayrollPeriodSchema = SchemaFactory.createForClass(PayrollPeriod)