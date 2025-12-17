/**
 * # Application – Create DTO
 *
 * DTO used to submit new job applications.
 * Matches `Application` schema primary relations:
 * - candidateId (required)
 * - requisitionId (required)
 * - assignedHr? (ObjectId)
 *
 * Stage & status default to:
 * - currentStage: SCREENING
 * - status: SUBMITTED
 */

import { IsMongoId, IsOptional } from 'class-validator';

export class CreateApplicationDto {
  @IsMongoId()
  candidateId!: string;

  @IsMongoId()
  requisitionId!: string;

  @IsOptional()
  @IsMongoId()
  assignedHr?: string;
}
