/**
 * # JobRequisition – Update DTO
 *
 * DTO used to update job requisitions: status, dates, and basic details.
 * All fields are optional for PATCH-style updates.
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

import { PUBLISH_STATUSES } from './create-job-requisition.dto';
import type { PublishStatus } from './create-job-requisition.dto';

export class UpdateJobRequisitionDto {
  @IsOptional()
  @IsString()
  requisitionId?: string;

  @IsOptional()
  @IsMongoId()
  templateId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  openings?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsMongoId()
  hiringManagerId?: string;

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
