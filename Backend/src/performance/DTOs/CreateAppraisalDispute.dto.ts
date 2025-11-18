import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DisputeStatus } from '../models/AppraisalDispute.schema';

export class CreateAppraisalDisputeDto {
  @IsString()
  employeeId: string;

  @IsString()
  ratingId: string;

  @IsString()
  reason: string;

  @IsEnum(DisputeStatus)
  status: DisputeStatus;

  @IsOptional()
  @IsString()
  resolvedBy?: string;

  @IsOptional()
  @IsString()
  resolutionComment?: string;
}
