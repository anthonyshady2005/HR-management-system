/**
 * # JobRequisition – Create DTO
 *
 * DTO used to create new job requisitions.
 * Matches `JobRequisition` schema:
 * - requisitionId (required)
 * - templateId (ObjectId)
 * - openings (required number)
 * - location? (string)
 * - hiringManagerId (ObjectId, required)
 * - publishStatus ('draft' | 'published' | 'closed')
 * - postingDate? / expiryDate? (Date)
 */

import {
  IsString,
  IsOptional,
  IsMongoId,
  IsInt,
  Min,
  IsIn,
  IsDateString,
} from 'class-validator';

export const PUBLISH_STATUSES = ['draft', 'published', 'closed'] as const;
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export class CreateJobRequisitionDto {
  @IsString()
  requisitionId!: string;

  @IsOptional()
  @IsMongoId()
  templateId?: string;

  @IsInt()
  @Min(1)
  openings!: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsMongoId()
  hiringManagerId!: string;

  @IsOptional()
  @IsIn(PUBLISH_STATUSES)
  publishStatus?: PublishStatus;

  @IsOptional()
  @IsDateString()
  postingDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
