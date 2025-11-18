import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsBoolean,
  IsMongoId,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class LeaveDocumentDto {
  @ApiProperty({
    description: 'URL or path to the uploaded document',
    example: '/uploads/medical-cert-001.pdf',
  })
  @IsString()
  documentUrl: string;

  @ApiProperty({
    description: 'Type of document',
    example: 'Medical Certificate',
  })
  @IsString()
  documentType: string;

  @ApiPropertyOptional({
    description: 'Original file name',
    example: 'medical-cert-001.pdf',
  })
  @IsString()
  @IsOptional()
  fileName?: string;
}

export class CreateLeaveRequestDto {
  @ApiProperty({
    description: 'Employee ID submitting the leave request',
    example: 'EMP001',
  })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({
    description: 'MongoDB ObjectId of the leave type',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsNotEmpty()
  leaveTypeId: string;

  @ApiProperty({
    description: 'Start date of the leave (ISO format)',
    example: '2025-12-01',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    description: 'End date of the leave (ISO format)',
    example: '2025-12-05',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty({
    description: 'Reason for taking leave',
    example: 'Family vacation',
    minLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Whether this is a retroactive leave request (submitted after leave taken)',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPostLeave?: boolean;

  @ApiPropertyOptional({
    description: 'Supporting documents (required for sick leave > 1 day)',
    type: [LeaveDocumentDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LeaveDocumentDto)
  @IsOptional()
  documents?: LeaveDocumentDto[];
}