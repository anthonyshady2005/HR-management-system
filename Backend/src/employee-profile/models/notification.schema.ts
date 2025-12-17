import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

export enum NotificationType {
  CHANGE_REQUEST_SUBMITTED = 'CHANGE_REQUEST_SUBMITTED',
  CHANGE_REQUEST_APPROVED = 'CHANGE_REQUEST_APPROVED',
  CHANGE_REQUEST_REJECTED = 'CHANGE_REQUEST_REJECTED',
  PROFILE_UPDATED = 'PROFILE_UPDATED',
}

@Schema({ collection: 'notifications', timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: Object.values(NotificationType), 
    required: true 
  })
  type: NotificationType;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: Boolean, default: false })
  read: boolean;

  @Prop({ type: String })
  relatedId?: string; // e.g., requestId

  @Prop({ type: Date })
  readAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
