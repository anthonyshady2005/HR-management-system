import { IsEnum, IsMongoId, IsOptional, IsString } from "class-validator";
import { BonusStatus } from "../enums/payroll-execution-enum";

export class ApproveSigningBonusDto {
  @IsEnum(BonusStatus)
  status: BonusStatus; // approved, rejected

  @IsOptional()
  @IsString()
  reason?: string;

  @IsMongoId()
  approverId: string;
}
