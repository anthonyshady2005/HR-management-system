import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveTypeResponseDto } from './leave-type-response.dto';

export class LeaveEntitlementResponseDto {
  @ApiProperty({
    description: 'Entitlement ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Employee ID',
    example: '507f1f77bcf86cd799439012',
  })
  employeeId: string;

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
    description: 'Actual accrued days',
    example: 15,
  })
  accruedActual: number;

  @ApiProperty({
    description: 'Rounded accrued days',
    example: 15,
  })
  accruedRounded: number;

  @ApiProperty({
    description: 'Carry forward days',
    example: 5,
  })
  carryForward: number;

  @ApiProperty({
    description: 'Taken days',
    example: 10,
  })
  taken: number;

  @ApiProperty({
    description: 'Pending days',
    example: 5,
  })
  pending: number;

  @ApiProperty({
    description: 'Remaining days',
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
