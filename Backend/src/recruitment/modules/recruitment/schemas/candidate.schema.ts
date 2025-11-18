import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * CandidateStage Enum
 * -------------------
 * Tracks the current stage of a candidate in the recruitment process.
 */
export enum CandidateStage {
  APPLIED = 'APPLIED',
  SCREENING = 'SCREENING',
  INTERVIEW = 'INTERVIEW',
  OFFERED = 'OFFERED',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
}

/**
 * Candidate
 * ---------
 * Represents a person applying to one or more jobs.
 *
 * Fields:
 * - name: Candidate's full name (required)
 * - email: Contact email address (required)
 * - phone: Contact phone number (optional)
 * - resumeURL: URL/path to candidate's resume (optional)
 * - consentFlag: Data processing consent flag (defaults to false)
 * - appliedJobs: Array of ObjectId references to Job documents (defaults to [])
 * - currentStage: Current stage in the recruitment process (defaults to APPLIED)
 * - createdAt/updatedAt: Automatically managed timestamps
 */
export type CandidateDocument = Candidate & Document;

@Schema({ timestamps: true })
export class Candidate {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: false })
  phone?: string;

  @Prop({ required: false })
  resumeURL?: string;

  @Prop({ type: Boolean, default: false })
  consentFlag: boolean;

  // Jobs the candidate has applied to
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Job' }], default: [] })
  appliedJobs: Types.ObjectId[];

  @Prop({
    type: String,
    enum: CandidateStage,
    default: CandidateStage.APPLIED,
  })
  currentStage: CandidateStage;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);
