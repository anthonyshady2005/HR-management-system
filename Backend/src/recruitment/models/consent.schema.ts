import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ConsentDocument = HydratedDocument<Consent>;

@Schema({ timestamps: true })
export class Consent {
  @Prop({ type: Types.ObjectId, ref: 'Application', required: true })
  applicationId: Types.ObjectId;

  @Prop({ required: true, default: false })
  consentGiven: boolean;

  @Prop({ required: true })
  consentType: string; // 'DATA_PROCESSING', 'BACKGROUND_CHECK', etc.

  @Prop()
  consentDate?: Date;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop()
  withdrawnAt?: Date;

  @Prop()
  withdrawnReason?: string;
}

export const ConsentSchema = SchemaFactory.createForClass(Consent);

