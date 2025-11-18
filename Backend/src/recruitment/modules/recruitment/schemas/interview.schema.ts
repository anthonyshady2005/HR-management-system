import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Interview
 * ---------
 * Represents an interview instance for a candidate for a specific job.
 *
 * Fields:
 * - candidateId: Reference to the Candidate document (required, ObjectId)
 * - jobId: Reference to the Job document (required, ObjectId)
 * - panel: Array of interviewer names or IDs (defaults to [])
 * - scores: Flexible scores object, e.g. { "technical": 4, "communication": 5 } (defaults to {})
 * - structuredFeedback: Structured feedback text (optional)
 * - scheduledAt: Date and time when the interview is scheduled (required)
 * - createdAt/updatedAt: Automatically managed timestamps
 */
export type InterviewDocument = Interview & Document;

@Schema({ timestamps: true })
export class Interview {
  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true })
  candidateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
  jobId: Types.ObjectId;

  // Names or IDs of interviewers
  @Prop({ type: [String], default: [] })
  panel: string[];

  // Flexible scores object, e.g. { "technical": 4, "communication": 5 }
  @Prop({ type: Object, default: {} })
  scores: Record<string, number>;

  @Prop({ type: String, required: false })
  structuredFeedback?: string;

  @Prop({ type: Date, required: true })
  scheduledAt: Date;
}

export const InterviewSchema = SchemaFactory.createForClass(Interview);
