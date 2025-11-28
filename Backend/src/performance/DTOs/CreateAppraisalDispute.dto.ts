import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AppraisalDisputeStatus } from '../enums/performance.enums';

export class CreateAppraisalDisputeDto {
  @IsString()
  employeeId: string;

  @IsString()
  ratingId: string;

  @IsString()
  reason: string;

  @IsEnum(AppraisalDisputeStatus)
  status: AppraisalDisputeStatus;

  @IsOptional()
  @IsString()
  resolvedBy?: string;

  @IsOptional()
  @IsString()
  resolutionComment?: string;
}
