import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttachmentType } from '../enums/attachment-type.enum';

export class CreateLeaveTypeDto {
  @ApiProperty({
    description: 'Unique code for the leave type',
    example: 'ANN',
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  code: string;

  @ApiProperty({
    description: 'Name of the leave type',
    example: 'Annual Leave',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'ID of the leave category',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Description of the leave type',
    example: 'Annual vacation leave for employees',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether this leave type is paid',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  paid?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this leave is deductible from balance',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  deductible?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this leave type requires attachment',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  requiresAttachment?: boolean;

  @ApiPropertyOptional({
    description: 'Type of attachment required',
    example: 'medical',
    enum: AttachmentType,
  })
  @IsEnum(AttachmentType)
  @IsOptional()
  attachmentType?: AttachmentType;

  @ApiPropertyOptional({
    description: 'Minimum tenure in months required for this leave',
    example: 6,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minTenureMonths?: number;

  @ApiPropertyOptional({
    description: 'Maximum duration in days for this leave type',
    example: 30,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxDurationDays?: number;
}
