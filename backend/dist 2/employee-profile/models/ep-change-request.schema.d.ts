import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';
import { ProfileChangeStatus } from '../enums/employee-profile.enums';
export type EmployeeProfileChangeRequestDocument = HydratedDocument<EmployeeProfileChangeRequest>;
export declare class FieldChange {
    fieldName: string;
    oldValue: unknown;
    newValue: unknown;
}
export declare const FieldChangeSchema: MongooseSchema<FieldChange, import("mongoose").Model<FieldChange, any, any, any, import("mongoose").Document<unknown, any, FieldChange, any, {}> & FieldChange & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, FieldChange, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<FieldChange>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<FieldChange> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class EmployeeProfileChangeRequest {
    requestId: string;
    employeeProfileId: Types.ObjectId;
    requestDescription: string;
    fieldChanges: FieldChange[];
    reason?: string;
    status: ProfileChangeStatus;
    submittedAt: Date;
    processedByEmployeeId?: Types.ObjectId;
    processedAt?: Date;
    processingComments?: string;
}
export declare const EmployeeProfileChangeRequestSchema: MongooseSchema<EmployeeProfileChangeRequest, import("mongoose").Model<EmployeeProfileChangeRequest, any, any, any, import("mongoose").Document<unknown, any, EmployeeProfileChangeRequest, any, {}> & EmployeeProfileChangeRequest & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EmployeeProfileChangeRequest, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<EmployeeProfileChangeRequest>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<EmployeeProfileChangeRequest> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
