import mongoose, { HydratedDocument } from 'mongoose';
export type systembackupDocument = HydratedDocument<systembackup>;
export declare class systembackup {
    backup_date: Date;
}
export declare const SystemBackupSchema: mongoose.Schema<systembackup, mongoose.Model<systembackup, any, any, any, mongoose.Document<unknown, any, systembackup, any, {}> & systembackup & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, systembackup, mongoose.Document<unknown, {}, mongoose.FlatRecord<systembackup>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<systembackup> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
