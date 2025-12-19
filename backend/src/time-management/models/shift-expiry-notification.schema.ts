/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Shift Expiry Notification
 * Simple notification entity for expiring shift assignments
 */
@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class ShiftExpiryNotification {
  @Prop({ required: true })
  assignmentId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;
}

export type ShiftExpiryNotificationDocument =
  ShiftExpiryNotification & Document;

export const ShiftExpiryNotificationSchema =
  SchemaFactory.createForClass(ShiftExpiryNotification);
