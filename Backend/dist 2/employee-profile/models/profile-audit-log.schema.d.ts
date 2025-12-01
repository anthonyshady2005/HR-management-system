import { HydratedDocument, Types } from 'mongoose';
export type ProfileAuditLogDocument = HydratedDocument<ProfileAuditLog>;
export declare class ProfileAuditLog {
    employeeProfileId: Types.ObjectId;
    performedByEmployeeId: Types.ObjectId;
    action: string;
    changeRequestId?: string;
    previousValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    changedFields: string[];
    reason?: string;
    ipAddress?: string;
    performedAt: Date;
}
export declare const ProfileAuditLogSchema: import("mongoose").Schema<ProfileAuditLog, import("mongoose").Model<ProfileAuditLog, any, any, any, import("mongoose").Document<unknown, any, ProfileAuditLog, any, {}> & ProfileAuditLog & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProfileAuditLog, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ProfileAuditLog>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ProfileAuditLog> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
