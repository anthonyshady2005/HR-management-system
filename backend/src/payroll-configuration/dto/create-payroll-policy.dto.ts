import { IsString, IsNotEmpty, IsEnum, IsDateString, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PolicyType, Applicability } from '../enums/payroll-configuration-enums';

class RuleDefinitionDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @IsNumber()
  @Min(0)
  fixedAmount: number;

  @IsNumber()
  @Min(1)
  thresholdAmount: number;
}

export class CreatePayrollPolicyDto {
  @IsString()
  @IsNotEmpty()
  policyName: string;

  @IsEnum(PolicyType)
  @IsNotEmpty()
  policyType: PolicyType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  effectiveDate: Date;

  @ValidateNested()
  @Type(() => RuleDefinitionDto)
  @IsNotEmpty()
  ruleDefinition: RuleDefinitionDto;

  @IsEnum(Applicability)
  @IsNotEmpty()
  applicability: Applicability;
}
