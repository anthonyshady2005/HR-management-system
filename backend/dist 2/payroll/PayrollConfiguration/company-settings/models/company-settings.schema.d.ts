import { HydratedDocument } from 'mongoose';
export type CompanySettingsDocument = HydratedDocument<CompanySettings>;
export declare enum CompanySettingsStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    REJECTED = "rejected"
}
export declare class CompanySettings {
    pay_date: number;
    time_zone: string;
    currency: string;
    status: CompanySettingsStatus;
}
export declare const CompanySettingsSchema: import("mongoose").Schema<CompanySettings, import("mongoose").Model<CompanySettings, any, any, any, import("mongoose").Document<unknown, any, CompanySettings, any, {}> & CompanySettings & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CompanySettings, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<CompanySettings>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<CompanySettings> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
