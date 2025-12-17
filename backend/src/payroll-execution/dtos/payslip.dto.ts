import { IsArray, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { PaySlipPaymentStatus } from "../enums/payroll-execution-enum";

// Nested DTOs for Earnings
export class AllowanceItemDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class SigningBonusItemDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class TerminationBenefitItemDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class RefundItemDto {
  @IsString()
  reason: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class EarningsDto {
  @IsNumber()
  @Min(0)
  baseSalary: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllowanceItemDto)
  allowances: AllowanceItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SigningBonusItemDto)
  bonuses?: SigningBonusItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TerminationBenefitItemDto)
  benefits?: TerminationBenefitItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RefundItemDto)
  refunds?: RefundItemDto[];
}

// Nested DTOs for Deductions
export class TaxItemDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  rate: number;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class InsuranceItemDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  rate: number;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class PenaltyItemDto {
  @IsString()
  reason: string;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class PenaltiesDto {
  @IsMongoId()
  employeeId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PenaltyItemDto)
  penalties?: PenaltyItemDto[];
}

export class DeductionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxItemDto)
  taxes: TaxItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InsuranceItemDto)
  insurances?: InsuranceItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PenaltiesDto)
  penalties?: PenaltiesDto;
}

// Main Payslip DTOs
export class CreatePayslipDto {
  @IsMongoId()
  employeeId: string;

  @IsMongoId()
  payrollRunId: string;

  @ValidateNested()
  @Type(() => EarningsDto)
  earningsDetails: EarningsDto;

  @ValidateNested()
  @Type(() => DeductionsDto)
  deductionsDetails: DeductionsDto;

  @IsNumber()
  @Min(0)
  totalGrossSalary: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totaDeductions?: number;

  @IsNumber()
  @Min(0)
  netPay: number;

  @IsOptional()
  @IsEnum(PaySlipPaymentStatus)
  paymentStatus?: PaySlipPaymentStatus;
}

export class UpdatePayslipDto {
  @IsOptional()
  @IsMongoId()
  employeeId?: string;

  @IsOptional()
  @IsMongoId()
  payrollRunId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => EarningsDto)
  earningsDetails?: EarningsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeductionsDto)
  deductionsDetails?: DeductionsDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalGrossSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totaDeductions?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  netPay?: number;

  @IsOptional()
  @IsEnum(PaySlipPaymentStatus)
  paymentStatus?: PaySlipPaymentStatus;
}
