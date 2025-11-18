import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * OfferAcceptanceStatus Enum
 * --------------------------
 * Tracks the status of an offer letter acceptance.
 */
export enum OfferAcceptanceStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

/**
 * OfferLetter
 * -----------
 * Represents a job offer made to a candidate.
 * When acceptanceStatus is ACCEPTED, this can trigger onboarding integration.
 *
 * Fields:
 * - candidateId: Reference to the Candidate document (required, ObjectId)
 * - jobId: Reference to the Job document (required, ObjectId)
 * - jobDetails: Snapshot of job details at the time of offer (defaults to {})
 * - salary: Offered salary amount (required, number)
 * - benefits: Benefits description (optional)
 * - acceptanceStatus: Status of offer acceptance (defaults to PENDING, enum)
 * - signedAt: Date when the offer was signed/accepted (optional)
 * - createdAt/updatedAt: Automatically managed timestamps
 */
export type OfferLetterDocument = OfferLetter & Document;

@Schema({ timestamps: true })
export class OfferLetter {
  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true })
  candidateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
  jobId: Types.ObjectId;

  // Snapshot of job details at the time of offer (optional but useful)
  @Prop({ type: Object, default: {} })
  jobDetails: Record<string, any>;

  @Prop({ type: Number, required: true })
  salary: number;

  @Prop({ type: String, required: false })
  benefits?: string;

  @Prop({
    type: String,
    enum: OfferAcceptanceStatus,
    default: OfferAcceptanceStatus.PENDING,
  })
  acceptanceStatus: OfferAcceptanceStatus;

  @Prop({ type: Date, required: false })
  signedAt?: Date;
}

export const OfferLetterSchema = SchemaFactory.createForClass(OfferLetter);
