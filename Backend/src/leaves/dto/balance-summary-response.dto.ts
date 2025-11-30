import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveTypeResponseDto } from './leave-type-response.dto';

export class BalanceSummaryResponseDto {
  @ApiProperty({
    description: 'Leave type details',
    type: () => LeaveTypeResponseDto,
  })
  leaveType: LeaveTypeResponseDto;

  @ApiProperty({
    description: 'Yearly entitlement',
    example: 30,
  })
  yearlyEntitlement: number;

  @ApiProperty({
    description: 'Carry forward from previous period',
    example: 5,
  })
  carryForward: number;

  @ApiProperty({
    description: 'Total available days',
    example: 35,
  })
  totalAvailable: number;

  @ApiProperty({
    description: 'Days taken',
    example: 10,
  })
  taken: number;

  @ApiProperty({
    description: 'Days pending approval',
    example: 5,
  })
  pending: number;

  @ApiProperty({
    description: 'Days remaining',
    example: 20,
  })
  remaining: number;

  @ApiPropertyOptional({
    description: 'Last accrual date',
    example: '2024-11-01T00:00:00Z',
  })
  lastAccrualDate?: Date;

  @ApiPropertyOptional({
    description: 'Next reset date',
    example: '2025-01-01T00:00:00Z',
  })
  nextResetDate?: Date;
}
