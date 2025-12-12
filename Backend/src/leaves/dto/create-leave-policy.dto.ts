import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  IsBoolean,
  IsObject,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccrualMethod } from '../enums/accrual-method.enum';
import { RoundingRule } from '../enums/rounding-rule.enum';
import { ContractType, JobPosition } from '../../employee-profile/enums/employee-profile.enums';
import { Type } from 'class-transformer';

class EligibilityDto {
  @ApiPropertyOptional({
    description: 'Minimum tenure in months required to be eligible',
    example: 6,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minTenureMonths?: number;

  @ApiPropertyOptional({
    description: 'Allowed job positions',
    isArray: true,
    enum: JobPosition,
    example: [JobPosition.MANAGER, JobPosition.SENIOR],
  })
  @IsArray()
  @IsEnum(JobPosition, { each: true })
  @IsOptional()
  positionsAllowed?: JobPosition[];

  @ApiPropertyOptional({
    description: 'Allowed contract types',
    isArray: true,
    enum: ContractType,
    example: [ContractType.FULL_TIME_CONTRACT],
  })
  @IsArray()
  @IsEnum(ContractType, { each: true })
  @IsOptional()
  contractTypesAllowed?: ContractType[];
}

export class CreateLeavePolicyDto {
  @ApiProperty({
    description: 'ID of the leave type this policy applies to',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsNotEmpty()
  leaveTypeId: string;

  @ApiPropertyOptional({
    description: 'Accrual method for this leave type',
    example: 'monthly',
    enum: AccrualMethod,
    default: AccrualMethod.MONTHLY,
  })
  @IsEnum(AccrualMethod)
  @IsOptional()
  accrualMethod?: AccrualMethod;

  @ApiPropertyOptional({
    description: 'Monthly accrual rate in days',
    example: 2.5,
    minimum: 0,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyRate?: number;

  @ApiPropertyOptional({
    description: 'Yearly accrual rate in days',
    example: 30,
    minimum: 0,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  yearlyRate?: number;

  @ApiPropertyOptional({
    description: 'Whether carry forward is allowed',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  carryForwardAllowed?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum days that can be carried forward',
    example: 15,
    minimum: 0,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxCarryForward?: number;

  @ApiPropertyOptional({
    description: 'Number of months after which carried forward leave expires',
    example: 3,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  expiryAfterMonths?: number;

  @ApiPropertyOptional({
    description: 'Rounding rule for accrued leave',
    example: 'round',
    enum: RoundingRule,
    default: RoundingRule.NONE,
  })
  @IsEnum(RoundingRule)
  @IsOptional()
  roundingRule?: RoundingRule;

  @ApiPropertyOptional({
    description: 'Minimum notice days required before taking leave',
    example: 3,
    minimum: 0,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minNoticeDays?: number;

  @ApiPropertyOptional({
    description: 'Maximum consecutive days allowed for this leave type',
    example: 14,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxConsecutiveDays?: number;

  @ApiPropertyOptional({
    description: 'Eligibility criteria for this leave type',
    type: () => EligibilityDto,
  })
  @ValidateNested()
  @Type(() => EligibilityDto)
  @IsOptional()
  eligibility?: EligibilityDto;
}
