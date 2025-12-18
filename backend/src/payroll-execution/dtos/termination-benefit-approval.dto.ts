import { IsEnum, IsMongoId, IsOptional, IsString } from "class-validator";
import { BenefitStatus } from "../enums/payroll-execution-enum";

export class ApproveTerminationBenefitDto {
  @IsEnum(BenefitStatus)
  status: BenefitStatus; // approved, rejected

  @IsOptional()
  @IsString()
  reason?: string;

  @IsMongoId()
  approverId: string;
}
