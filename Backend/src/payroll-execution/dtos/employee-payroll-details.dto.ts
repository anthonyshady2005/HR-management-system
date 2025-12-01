import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { BankStatus } from "../enums/payroll-execution-enum";

export class CreateEmployeePayrollDetailsDto {
  @IsMongoId()
  employeeId: string;

  @IsNumber()
  @Min(0)
  baseSalary: number;

  @IsNumber()
  @Min(0)
  allowances: number;

  @IsNumber()
  @Min(0)
  deductions: number;

  @IsNumber()
  @Min(0)
  netSalary: number;

  @IsNumber()
  @Min(0)
  netPay: number;

  @IsEnum(BankStatus)
  bankStatus: BankStatus;

  @IsOptional()
  @IsString()
  exceptions?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bonus?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  benefit?: number;

  @IsMongoId()
  payrollRunId: string;
}

export class UpdateEmployeePayrollDetailsDto {
  @IsOptional()
  @IsMongoId()
  employeeId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  baseSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  allowances?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deductions?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  netSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  netPay?: number;

  @IsOptional()
  @IsEnum(BankStatus)
  bankStatus?: BankStatus;

  @IsOptional()
  @IsString()
  exceptions?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bonus?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  benefit?: number;

  @IsOptional()
  @IsMongoId()
  payrollRunId?: string;
}
