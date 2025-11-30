import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveCategoryResponseDto } from './leave-category-response.dto';

export class LeaveTypeResponseDto {
  @ApiProperty({
    description: 'Leave Type ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Leave type code',
    example: 'ANN',
  })
  code: string;

  @ApiProperty({
    description: 'Leave type name',
    example: 'Annual Leave',
  })
  name: string;

  @ApiProperty({
    description: 'Associated leave category',
    type: () => LeaveCategoryResponseDto,
  })
  category: LeaveCategoryResponseDto;

  @ApiPropertyOptional({
    description: 'Leave type description',
    example: 'Annual vacation leave for employees',
  })
  description?: string;

  @ApiProperty({
    description: 'Whether this leave is paid',
    example: true,
  })
  paid: boolean;

  @ApiProperty({
    description: 'Whether this leave is deductible',
    example: true,
  })
  deductible: boolean;

  @ApiProperty({
    description: 'Whether attachment is required',
    example: false,
  })
  requiresAttachment: boolean;

  @ApiPropertyOptional({
    description: 'Type of attachment required',
    example: 'medical',
  })
  attachmentType?: string;

  @ApiPropertyOptional({
    description: 'Minimum tenure required in months',
    example: 6,
  })
  minTenureMonths?: number;

  @ApiPropertyOptional({
    description: 'Maximum duration in days',
    example: 30,
  })
  maxDurationDays?: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-11-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-11-15T10:30:00Z',
  })
  updatedAt: Date;
}
