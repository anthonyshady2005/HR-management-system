import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PositionDocument = HydratedDocument<Position>;

@Schema({ collection: 'positions', timestamps: true })
export class Position {
  @Prop({ type: String, required: true, unique: true })
  code: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Position' })
  reportsToPositionId?: Types.ObjectId;

  // added this because we need to link the position to a pay grade
  @Prop({ type: Types.ObjectId, ref: 'payGrade' })
  payGradeId?: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const PositionSchema = SchemaFactory.createForClass(Position);


// this is not AI generated note, it's me aly hossam saying that hooks here caused
// circular dependency issues, so we need to remove them and handle them in the service.
// Note: Hooks that depend on Department (e.g., auto-setting reportsToPositionId)
// are handled in OrganizationStructureService where DepartmentModel is injected
// via NestJS dependency injection.
