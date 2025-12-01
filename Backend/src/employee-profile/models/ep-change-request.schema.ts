import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';
import { ProfileChangeStatus } from '../enums/employee-profile.enums';

export type EmployeeProfileChangeRequestDocument =
  HydratedDocument<EmployeeProfileChangeRequest>;

@Schema({ _id: false })
export class FieldChange {
  @Prop({ type: String, required: true })
  fieldName: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  oldValue: unknown;

  @Prop({ type: MongooseSchema.Types.Mixed })
  newValue: unknown;
}

export const FieldChangeSchema = SchemaFactory.createForClass(FieldChange);

@Schema({ collection: 'employee_profile_change_requests', timestamps: true })
export class EmployeeProfileChangeRequest {
  @Prop({ type: String, required: true, unique: true })
  requestId: string;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeProfileId: Types.ObjectId;

  @Prop({ type: String, required: true })
  requestDescription: string;

  @Prop({ type: [FieldChangeSchema], default: [] })
  fieldChanges: FieldChange[];

  @Prop({ type: String })
  reason?: string;

  @Prop({
    type: String,
    enum: Object.values(ProfileChangeStatus),
    default: ProfileChangeStatus.PENDING,
  })
  status: ProfileChangeStatus;

  @Prop({ type: Date, default: () => new Date() })
  submittedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile' })
  processedByEmployeeId?: Types.ObjectId;

  @Prop({ type: Date })
  processedAt?: Date;

  @Prop({ type: String })
  processingComments?: string;
}

export const EmployeeProfileChangeRequestSchema = SchemaFactory.createForClass(
  EmployeeProfileChangeRequest,
);
