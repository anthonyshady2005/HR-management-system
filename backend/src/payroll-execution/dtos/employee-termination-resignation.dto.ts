import { IsEnum, IsMongoId, IsOptional } from "class-validator";
import { BenefitStatus } from "../enums/payroll-execution-enum";

export class CreateEmployeeTerminationResignationDto {
  @IsMongoId()
  employeeId: string;

  @IsMongoId()
  benefitId: string;

  @IsMongoId()
  terminationId: string;

  @IsOptional()
  @IsEnum(BenefitStatus)
  status?: BenefitStatus;
}

export class UpdateEmployeeTerminationResignationDto {
  @IsOptional()
  @IsMongoId()
  employeeId?: string;

  @IsOptional()
  @IsMongoId()
  benefitId?: string;

  @IsOptional()
  @IsMongoId()
  terminationId?: string;

  @IsOptional()
  @IsEnum(BenefitStatus)
  status?: BenefitStatus;
}
