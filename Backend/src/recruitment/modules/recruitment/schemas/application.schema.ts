import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * ApplicationStage Enum
 * ---------------------
 * Tracks the stage of a specific application (candidate + job combination).
 */
export enum ApplicationStage {
  APPLIED = 'APPLIED',
  SCREENING = 'SCREENING',
  INTERVIEW = 'INTERVIEW',
  OFFERED = 'OFFERED',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
}

/**
 * ApplicationStageHistory
 * -----------------------
 * Tracks stage changes over time for a single application.
 * This provides timestamps for each stage transition.
 *
 * Fields:
 * - stage: The stage that was entered (required, enum)
 * - changedAt: Timestamp when the stage change occurred (required)
 * - comment: Optional comment about the stage change
 */
@Schema({ _id: false })
export class ApplicationStageHistory {
  @Prop({
    type: String,
    enum: ApplicationStage,
    required: true,
  })
  stage: ApplicationStage;

  @Prop({ type: Date, required: true })
  changedAt: Date;

  @Prop({ type: String, required: false })
  comment?: string;
}

export const ApplicationStageHistorySchema = SchemaFactory.createForClass(
  ApplicationStageHistory,
);

/**
 * Application / Pipeline
 * ---------------------
 * Connects a candidate to a specific job and tracks stage progression.
 * This represents the pipeline/application relationship between a candidate and a job.
 *
 * Fields:
 * - jobId: Reference to the Job document (required, ObjectId)
 * - candidateId: Reference to the Candidate document (required, ObjectId)
 * - stage: Current stage of the application (defaults to APPLIED, enum)
 * - stageHistory: Array of stage changes with timestamps (defaults to [])
 * - comments: General comments about the application (optional)
 * - createdAt/updatedAt: Automatically managed timestamps
 */
export type ApplicationDocument = Application & Document;

@Schema({ timestamps: true })
export class Application {
  @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
  jobId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true })
  candidateId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ApplicationStage,
    default: ApplicationStage.APPLIED,
  })
  stage: ApplicationStage;

  // History of stage changes (timestamps for each stage)
  @Prop({
    type: [ApplicationStageHistorySchema],
    default: [],
  })
  stageHistory: ApplicationStageHistory[];

  @Prop({ type: String, required: false })
  comments?: string;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
