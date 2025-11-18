import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CompanySettingsDocument = HydratedDocument<CompanySettings>;

export enum CompanySettingsStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  REJECTED = 'rejected',
}

@Schema()
export class CompanySettings {
  @Prop({ required: true })
  pay_date: number;

  @Prop({ required: true })
  time_zone: string;

  @Prop({ required: true })
  currency: string;

  @Prop({
    required: true,
    enum: CompanySettingsStatus,
    default: CompanySettingsStatus.DRAFT,
  })
  status: CompanySettingsStatus;
}

export const CompanySettingsSchema =
  SchemaFactory.createForClass(CompanySettings);
