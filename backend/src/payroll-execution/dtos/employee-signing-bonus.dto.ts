import { IsDateString, IsEnum, IsMongoId, IsOptional } from "class-validator";
import { BonusStatus } from "../enums/payroll-execution-enum";

export class CreateEmployeeSigningBonusDto {
  @IsMongoId()
  employeeId: string;

  @IsMongoId()
  signingBonusId: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsEnum(BonusStatus)
  status?: BonusStatus;
}

export class UpdateEmployeeSigningBonusDto {
  @IsOptional()
  @IsMongoId()
  employeeId?: string;

  @IsOptional()
  @IsMongoId()
  signingBonusId?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsEnum(BonusStatus)
  status?: BonusStatus;
}
