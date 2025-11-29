import { IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBalanceDto {
    @ApiPropertyOptional({
        description: 'Updated yearly entitlement',
        example: 30,
        minimum: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    yearlyEntitlement?: number;

    @ApiPropertyOptional({
        description: 'Updated actual accrued days',
        example: 15,
        minimum: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    accruedActual?: number;

    @ApiPropertyOptional({
        description: 'Updated rounded accrued days',
        example: 15,
        minimum: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    accruedRounded?: number;

    @ApiPropertyOptional({
        description: 'Updated carry forward days',
        example: 5,
        minimum: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    carryForward?: number;

    @ApiPropertyOptional({
        description: 'Updated taken days',
        example: 10,
        minimum: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    taken?: number;

    @ApiPropertyOptional({
        description: 'Updated pending days',
        example: 5,
        minimum: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    pending?: number;
}