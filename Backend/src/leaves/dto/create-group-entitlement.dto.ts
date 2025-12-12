import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsString,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GroupFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by department ID',
    example: '507f1f77bcf86cd799439014',
  })
  @IsMongoId()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by position ID',
    example: '507f1f77bcf86cd799439015',
  })
  @IsMongoId()
  @IsOptional()
  positionId?: string;

  @ApiPropertyOptional({
    description: 'Filter by contract type',
    example: 'Permanent',
  })
  @IsString()
  @IsOptional()
  contractType?: string;

  @ApiPropertyOptional({
    description: 'Filter by minimum tenure in months',
    example: 6,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minTenure?: number;
}

export class CreateGroupEntitlementDto {
  @ApiProperty({
    description: 'Filters to select employee group',
    type: GroupFiltersDto,
  })
  @ValidateNested()
  @Type(() => GroupFiltersDto)
  @IsNotEmpty()
  filters: GroupFiltersDto;

  @ApiProperty({
    description: 'ID of the leave type',
    example: '507f1f77bcf86cd799439013',
  })
  @IsMongoId()
  @IsNotEmpty()
  leaveTypeId: string;

  @ApiPropertyOptional({
    description: 'Yearly entitlement in days',
    example: 30,
    minimum: 0,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  yearlyEntitlement?: number;

  @ApiPropertyOptional({
    description: 'Actual accrued days',
    example: 15,
    minimum: 0,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  accruedActual?: number;

  @ApiPropertyOptional({
    description: 'Rounded accrued days',
    example: 15,
    minimum: 0,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  accruedRounded?: number;

  @ApiPropertyOptional({
    description: 'Carry forward days from previous period',
    example: 5,
    minimum: 0,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  carryForward?: number;

  @ApiPropertyOptional({
    description: 'Whether to create personalized entitlements (not based on policy)',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  personalized?: boolean;
}
