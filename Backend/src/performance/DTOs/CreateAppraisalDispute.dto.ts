import { IsString, IsOptional, IsEnum, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { AppraisalDisputeStatus } from '../enums/performance.enums';

export class CreateAppraisalDisputeDTO {
  @ApiProperty()
  @IsString()
  appraisalId: string;

  @ApiProperty()
  @IsString()
  assignmentId: string;

  @ApiProperty()
  @IsString()
  cycleId: string;

  @ApiProperty()
  @IsString()
  raisedByEmployeeId: string;

  @ApiProperty()
  @IsString()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  details?: string;

  @ApiPropertyOptional({ enum: AppraisalDisputeStatus })
  @IsOptional()
  @IsEnum(AppraisalDisputeStatus)
  status?: AppraisalDisputeStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedReviewerEmployeeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resolutionSummary?: string;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  resolvedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resolvedByEmployeeId?: string;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  submittedAt?: Date;
}
