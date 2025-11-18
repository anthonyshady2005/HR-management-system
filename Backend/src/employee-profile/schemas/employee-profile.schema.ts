/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EmployeeProfileDocument = EmployeeProfile & Document;

@Schema({ timestamps: true })
export class EmployeeProfile {
  // Identity & personal
  @Prop({ required: true, unique: true })
  employeeCode: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  // Contact
  @Prop({ required: true, unique: true })
  email: string; // work email

  @Prop()
  phone?: string;

  // Employment & org info
  @Prop({
    enum: ['Active', 'OnProbation', 'Suspended', 'Terminated', 'Resigned'],
    default: 'Active',
  })
  employmentStatus:
    | 'Active'
    | 'OnProbation'
    | 'Suspended'
    | 'Terminated'
    | 'Resigned';

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Position' })
  positionId?: MongooseSchema.Types.ObjectId; // ref to Org Structure - matches Organization Structure module's position _id

  // System roles
  @Prop({ type: [String], default: ['EMPLOYEE'] })
  systemRoles: string[]; // EMPLOYEE, MANAGER, HR_ADMIN, SYS_ADMIN, etc.

  @Prop({ default: true })
  isActive: boolean;

  // Profile meta
  @Prop()
  profilePictureUrl?: string;

 }

export const EmployeeProfileSchema =
  SchemaFactory.createForClass(EmployeeProfile);
