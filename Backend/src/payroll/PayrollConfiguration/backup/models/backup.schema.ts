import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type systembackupDocument = HydratedDocument<systembackup>;

@Schema({ timestamps: true })
export class systembackup {
  @Prop({ required: true })
  backup_date: Date;
}

export const SystemBackupSchema = SchemaFactory.createForClass(systembackup);
