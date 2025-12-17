import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';

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

// UTILITY TYPE GUARDS (keep these)
function isPositionUpdate(update: unknown): update is UpdateQuery<Position> {
  return Boolean(update) && typeof update === 'object' && !Array.isArray(update);
}

function isObjectIdLike(value: unknown): value is Types.ObjectId | string {
  return typeof value === 'string' || value instanceof Types.ObjectId;
}

// Note: remove all pre('save') and pre('findOneAndUpdate') hooks from here.
// Hooks that depend on Department must be handled in a service where DepartmentModel
// is injected via NestJS DI.
