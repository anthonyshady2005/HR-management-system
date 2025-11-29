import { IsMongoId, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEntitlementDto {
    @ApiProperty({
        description: 'ID of the employee',
        example: '507f1f77bcf86cd799439011'
    })
    @IsMongoId()
    @IsNotEmpty()
    employeeId: string;

    @ApiProperty({
        description: 'ID of the leave type',
        example: '507f1f77bcf86cd799439012'
    })
    @IsMongoId()
    @IsNotEmpty()
    leaveTypeId: string;

    @ApiPropertyOptional({
        description: 'Yearly entitlement in days',
        example: 30,
        minimum: 0,
        default: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    yearlyEntitlement?: number;

    @ApiPropertyOptional({
        description: 'Actual accrued days',
        example: 15,
        minimum: 0,
        default: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    accruedActual?: number;

    @ApiPropertyOptional({
        description: 'Rounded accrued days',
        example: 15,
        minimum: 0,
        default: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    accruedRounded?: number;

    @ApiPropertyOptional({
        description: 'Carry forward days from previous period',
        example: 5,
        minimum: 0,
        default: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    carryForward?: number;
}