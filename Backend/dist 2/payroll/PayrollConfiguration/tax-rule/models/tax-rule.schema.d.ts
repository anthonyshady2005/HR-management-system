import mongoose, { HydratedDocument } from 'mongoose';
export declare enum TaxRuleStatus {
    Draft = "draft",
    Active = "active"
}
export type TaxRuleDocument = HydratedDocument<TaxRule>;
export declare class TaxRule {
    name: string;
    percentage: number;
    status: TaxRuleStatus;
}
export declare const TaxRuleSchema: mongoose.Schema<TaxRule, mongoose.Model<TaxRule, any, any, any, mongoose.Document<unknown, any, TaxRule, any, {}> & TaxRule & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, TaxRule, mongoose.Document<unknown, {}, mongoose.FlatRecord<TaxRule>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<TaxRule> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
