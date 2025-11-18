import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsEnum,
  IsBoolean,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class EligibilityCriteriaDto {
  @IsNumber()
  @Min(0)
  minTenureMonths: number;

  @IsString({ each: true })
  contractTypes: string[];

  @IsString({ each: true })
  grades: string[];

  @IsString({ each: true })
  @IsOptional()
  departments?: string[];
}

class AccrualRulesDto {
  @IsEnum(['monthly', 'quarterly', 'annually', 'none'])
  accrualType: string;

  @IsNumber()
  @Min(0)
  accrualRate: number;

  @IsBoolean()
  pauseDuringUnpaidLeave: boolean;

  @IsBoolean()
  @IsOptional()
  pauseDuringSuspension?: boolean;
}

class CarryOverRulesDto {
  @IsNumber()
  @Min(0)
  maxCarryOverDays: number;

  @IsNumber()
  @Min(1)
  expiryMonths: number;

  @IsBoolean()
  @IsOptional()
  allowUnlimitedCarryOver?: boolean;
}

export class CreateVacationPackageDto {
  @IsString()
  @IsNotEmpty()
  packageId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
  entitlementDays: number;

  @ValidateNested()
  @Type(() => EligibilityCriteriaDto)
  eligibilityCriteria: EligibilityCriteriaDto;

  @ValidateNested()
  @Type(() => AccrualRulesDto)
  accrualRules: AccrualRulesDto;

  @ValidateNested()
  @Type(() => CarryOverRulesDto)
  carryOverRules: CarryOverRulesDto;

  @IsEnum(['hireDate', 'workReceivingDate', 'calendarYear'])
  @IsOptional()
  resetCriterion?: string;

  @IsString()
  @IsOptional()
  description?: string;
}