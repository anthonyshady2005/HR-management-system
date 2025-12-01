import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BlockedPeriodResponseDto {
  @ApiProperty({ description: 'Start date of blocked period' })
  from: Date;

  @ApiProperty({ description: 'End date of blocked period' })
  to: Date;

  @ApiProperty({ description: 'Reason for blocking this period' })
  reason: string;
}

export class CalendarResponseDto {
  @ApiProperty({ description: 'Calendar ID' })
  id: string;

  @ApiProperty({ description: 'Calendar year' })
  year: number;

  @ApiPropertyOptional({ description: 'Array of holiday IDs', type: [String] })
  holidays?: string[];

  @ApiPropertyOptional({
    description: 'Blocked periods',
    type: [BlockedPeriodResponseDto],
  })
  blockedPeriods?: BlockedPeriodResponseDto[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
