import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
  IsMongoId,
  MaxLength,
} from 'class-validator';

export class CreateLeaveTypeDto {
  @ApiProperty({
    description: 'Unique code for the leave type',
    example: 'ANN',
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  leaveTypeId: string;

  @ApiProperty({
    description: 'Display name of the leave type',
    example: 'Annual Leave',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'MongoDB ObjectId of the leave category',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: 'Whether this leave type is paid or unpaid',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isPaid: boolean;

  @ApiPropertyOptional({
    description: 'Whether supporting documents are required',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  requiresDocument?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum days allowed per single request',
    example: 15,
    minimum: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxDaysPerRequest?: number;

  @ApiPropertyOptional({
    description: 'Maximum days allowed per year',
    example: 21,
    minimum: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxDaysPerYear?: number;

  @ApiPropertyOptional({
    description: 'Whether this leave is deducted from employee balance',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isDeductedFromBalance?: boolean;

  @ApiPropertyOptional({
    description: 'Number of days after which document is required',
    example: 1,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  documentRequiredAfterDays?: number;

  @ApiPropertyOptional({
    description: 'Payroll pay code linked to this leave type for integration with Payroll subsystem (BR 6)',
    example: 'LEAVE-ANN',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  payCode?: string;

  @ApiPropertyOptional({
    description: 'Whether manager approval is required',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @ApiPropertyOptional({
    description: 'Whether unused days can be carried over to next year',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  canBeCarriedOver?: boolean;

  @ApiPropertyOptional({
    description: 'Whether unused days can be encashed',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  canBeEncashed?: boolean;

  @ApiPropertyOptional({
    description: 'Color code for UI display (hex format)',
    example: '#4CAF50',
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the leave type',
    example: 'Regular annual vacation leave as per labor law',
  })
  @IsString()
  @IsOptional()
  description?: string;
}