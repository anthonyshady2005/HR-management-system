import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * EmploymentType Enum
 * -------------------
 * Defines the types of employment available for job postings.
 */
export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  TEMPORARY = 'TEMPORARY',
}

/**
 * Job
 * ---
 * Represents an open position in the organization.
 *
 * Fields:
 * - title: Job title (required)
 * - department: Department where the position is located (required)
 * - location: Physical or remote location (required)
 * - description: Detailed job description (required)
 * - requirements: Array of job requirements/skills (optional, defaults to [])
 * - employmentType: Type of employment (required, enum)
 * - createdAt/updatedAt: Automatically managed timestamps
 */
export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  requirements: string[];

  @Prop({
    type: String,
    enum: EmploymentType,
    required: true,
  })
  employmentType: EmploymentType;
}

export const JobSchema = SchemaFactory.createForClass(Job);
