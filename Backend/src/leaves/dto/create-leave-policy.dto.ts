import { IsMongoId, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccrualMethod } from '../enums/accrual-method.enum';
import { RoundingRule } from '../enums/rounding-rule.enum';

export class CreateLeavePolicyDto {
    @ApiProperty({
        description: 'ID of the leave type this policy applies to',
        example: '507f1f77bcf86cd799439011'
    })
    @IsMongoId()
    @IsNotEmpty()
    leaveTypeId: string;

    @ApiPropertyOptional({
        description: 'Accrual method for this leave type',
        example: 'monthly',
        enum: AccrualMethod,
        default: AccrualMethod.MONTHLY
    })
    @IsEnum(AccrualMethod)
    @IsOptional()
    accrualMethod?: AccrualMethod;

    @ApiPropertyOptional({
        description: 'Monthly accrual rate in days',
        example: 2.5,
        minimum: 0,
        default: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    monthlyRate?: number;

    @ApiPropertyOptional({
        description: 'Yearly accrual rate in days',
        example: 30,
        minimum: 0,
        default: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    yearlyRate?: number;

    @ApiPropertyOptional({
        description: 'Whether carry forward is allowed',
        example: true,
        default: false
    })
    @IsBoolean()
    @IsOptional()
    carryForwardAllowed?: boolean;

    @ApiPropertyOptional({
        description: 'Maximum days that can be carried forward',
        example: 15,
        minimum: 0,
        default: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    maxCarryForward?: number;

    @ApiPropertyOptional({
        description: 'Number of months after which carried forward leave expires',
        example: 3,
        minimum: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    expiryAfterMonths?: number;

    @ApiPropertyOptional({
        description: 'Rounding rule for accrued leave',
        example: 'round',
        enum: RoundingRule,
        default: RoundingRule.NONE
    })
    @IsEnum(RoundingRule)
    @IsOptional()
    roundingRule?: RoundingRule;

    @ApiPropertyOptional({
        description: 'Minimum notice days required before taking leave',
        example: 3,
        minimum: 0,
        default: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    minNoticeDays?: number;

    @ApiPropertyOptional({
        description: 'Maximum consecutive days allowed for this leave type',
        example: 14,
        minimum: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    maxConsecutiveDays?: number;

    @ApiPropertyOptional({
        description: 'Eligibility criteria for this leave type',
        example: {
            minTenureMonths: 6,
            positionsAllowed: ['Manager', 'Senior Developer'],
            contractTypesAllowed: ['Full-time', 'Part-time']
        }
    })
    @IsObject()
    @IsOptional()
    eligibility?: Record<string, any>;
}
