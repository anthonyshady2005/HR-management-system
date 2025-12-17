import { IsString, IsOptional, IsEnum, ValidateNested, IsNumber, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';
import { AppraisalRecordStatus } from '../enums/performance.enums';

class RatingEntryDTO {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ratingLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ratingValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weightedScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comments?: string;
}

export class CreateAppraisalRecordDTO {
  @ApiProperty()
  @IsString()
  assignmentId: Types.ObjectId;

  @ApiProperty()
  @IsString()
  cycleId: Types.ObjectId;

  @ApiProperty()
  @IsString()
  templateId: Types.ObjectId;

  @ApiProperty()
  @IsString()
  employeeProfileId: Types.ObjectId;

  @ApiProperty()
  @IsString()
  managerProfileId: Types.ObjectId;

  @ApiProperty({ type: [RatingEntryDTO] })
  @ValidateNested({ each: true })
  @Type(() => RatingEntryDTO)
  ratings: RatingEntryDTO[];

  @ApiPropertyOptional()
  @IsOptional()
  totalScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  overallRatingLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  managerSummary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  strengths?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  improvementAreas?: string;

  @ApiPropertyOptional({ enum: AppraisalRecordStatus })
  @IsOptional()
  @IsEnum(AppraisalRecordStatus)
  status?: AppraisalRecordStatus;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  managerSubmittedAt?: Date;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  hrPublishedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  publishedByEmployeeId?: Types.ObjectId;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  employeeViewedAt?: Date;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  employeeAcknowledgedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeAcknowledgementComment?: string;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  archivedAt?: Date;
}
