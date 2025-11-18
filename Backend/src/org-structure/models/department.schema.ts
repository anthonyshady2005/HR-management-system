import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true })
export class Department {
  @Prop({ required: true })
  dep_name: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Department',
    default: null,
  })
  parent_dep_code?: string;

  @Prop({ required: true, unique: true })
  dep_code: string;

  @Prop({
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: 'active' | 'inactive';
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);

