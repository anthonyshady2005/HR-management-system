import mongoose, { HydratedDocument } from 'mongoose';
export type ApprovalChainDocument = HydratedDocument<ApprovalChain>;
export declare class ApprovalChain {
    run_id: mongoose.Types.ObjectId;
    stage: string;
    status: string;
    approver_id: string;
    reason: string;
    acted_at: Date;
}
export declare const ApprovalChainSchema: mongoose.Schema<ApprovalChain, mongoose.Model<ApprovalChain, any, any, any, mongoose.Document<unknown, any, ApprovalChain, any, {}> & ApprovalChain & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ApprovalChain, mongoose.Document<unknown, {}, mongoose.FlatRecord<ApprovalChain>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<ApprovalChain> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
