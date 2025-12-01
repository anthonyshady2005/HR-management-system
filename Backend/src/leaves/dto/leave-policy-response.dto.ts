import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveTypeResponseDto } from './leave-type-response.dto';

export class LeavePolicyResponseDto {
  @ApiProperty({
    description: 'Policy ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Associated leave type',
    type: () => LeaveTypeResponseDto,
  })
  leaveType: LeaveTypeResponseDto;

  @ApiProperty({
    description: 'Accrual method',
    example: 'monthly',
  })
  accrualMethod: string;

  @ApiProperty({
    description: 'Monthly accrual rate',
    example: 2.5,
  })
  monthlyRate: number;

  @ApiProperty({
    description: 'Yearly accrual rate',
    example: 30,
  })
  yearlyRate: number;

  @ApiProperty({
    description: 'Carry forward allowed',
    example: true,
  })
  carryForwardAllowed: boolean;

  @ApiProperty({
    description: 'Maximum carry forward days',
    example: 15,
  })
  maxCarryForward: number;

  @ApiPropertyOptional({
    description: 'Expiry after months',
    example: 3,
  })
  expiryAfterMonths?: number;

  @ApiProperty({
    description: 'Rounding rule',
    example: 'round',
  })
  roundingRule: string;

  @ApiProperty({
    description: 'Minimum notice days',
    example: 3,
  })
  minNoticeDays: number;

  @ApiPropertyOptional({
    description: 'Maximum consecutive days',
    example: 14,
  })
  maxConsecutiveDays?: number;

  @ApiPropertyOptional({
    description: 'Eligibility criteria',
    example: {
      minTenureMonths: 6,
      positionsAllowed: ['Manager'],
      contractTypesAllowed: ['Full-time'],
    },
  })
  eligibility?: Record<string, any>;

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
