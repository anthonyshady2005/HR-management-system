import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProfileAuditLogDocument = HydratedDocument<ProfileAuditLog>;

/**
 * Audit log for tracking all profile changes (BR 22).
 * Traces all editing, changes, and cancellations in a timestamped and trailed manner.
 */
@Schema({ collection: 'profile_audit_logs', timestamps: true })
export class ProfileAuditLog {
  @Prop({
    type: Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
    index: true,
  })
  employeeProfileId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  performedByEmployeeId: Types.ObjectId;

  @Prop({ type: String, required: true })
  action: string; // CREATE, UPDATE, DEACTIVATE, ROLE_CHANGE, CHANGE_REQUEST_APPROVE, etc.

  @Prop({ type: String })
  changeRequestId?: string; // If action was triggered by a change request

  @Prop({ type: Object })
  previousValues?: Record<string, unknown>;

  @Prop({ type: Object })
  newValues?: Record<string, unknown>;

  @Prop({ type: [String], default: [] })
  changedFields: string[];

  @Prop({ type: String })
  reason?: string;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: Date, default: () => new Date() })
  performedAt: Date;
}

export const ProfileAuditLogSchema =
  SchemaFactory.createForClass(ProfileAuditLog);

// Index for efficient querying
ProfileAuditLogSchema.index({ employeeProfileId: 1, performedAt: -1 });
ProfileAuditLogSchema.index({ performedByEmployeeId: 1, performedAt: -1 });
