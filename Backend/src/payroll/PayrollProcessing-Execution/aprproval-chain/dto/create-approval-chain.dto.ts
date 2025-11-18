import { IsIn, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateApprovalChainDto {
  @IsMongoId()
  run_id: string; // Mongo ObjectId string

  @IsString()
  @IsIn(['payroll_review', 'payroll_manager', 'finance'])
  stage: string;

  @IsOptional()
  @IsString()
  @IsIn(['approved', 'rejected'])
  status?: string;

  @IsString()
  approver_id: string; // employeeCode or id depending on schema

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  acted_at?: string; // ISO date string
}
