import { IsDateString, IsEnum, IsInt, IsMongoId, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { PayRollPaymentStatus, PayRollStatus } from "../enums/payroll-execution-enum";

export class CreatePayrollRunsDto {
  @IsString()
  runId: string;

  @IsDateString()
  payrollPeriod: string;

  @IsOptional()
  @IsEnum(PayRollStatus)
  status?: PayRollStatus;

  @IsString()
  entity: string;

  @IsInt()
  @Min(0)
  employees: number;

  @IsInt()
  @Min(0)
  exceptions: number;

  @IsNumber()
  @Min(0)
  totalnetpay: number;

  @IsMongoId()
  payrollSpecialistId: string;

  @IsOptional()
  @IsEnum(PayRollPaymentStatus)
  paymentStatus?: PayRollPaymentStatus;

  @IsMongoId()
  payrollManagerId: string;

  @IsOptional()
  @IsMongoId()
  financeStaffId?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  unlockReason?: string;

  @IsOptional()
  @IsDateString()
  managerApprovalDate?: string;

  @IsOptional()
  @IsDateString()
  financeApprovalDate?: string;
}

export class UpdatePayrollRunsDto {
  @IsOptional()
  @IsString()
  runId?: string;

  @IsOptional()
  @IsDateString()
  payrollPeriod?: string;

  @IsOptional()
  @IsEnum(PayRollStatus)
  status?: PayRollStatus;

  @IsOptional()
  @IsString()
  entity?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  employees?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  exceptions?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalnetpay?: number;

  @IsOptional()
  @IsMongoId()
  payrollSpecialistId?: string;

  @IsOptional()
  @IsEnum(PayRollPaymentStatus)
  paymentStatus?: PayRollPaymentStatus;

  @IsOptional()
  @IsMongoId()
  payrollManagerId?: string;

  @IsOptional()
  @IsMongoId()
  financeStaffId?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  unlockReason?: string;

  @IsOptional()
  @IsDateString()
  managerApprovalDate?: string;

  @IsOptional()
  @IsDateString()
  financeApprovalDate?: string;
}
