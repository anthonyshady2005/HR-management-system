import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsMongoId } from 'class-validator';

export class NetDaysCalculationDto {
  @ApiProperty({
    description: 'Employee ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsMongoId()
  employeeId: string;

  @ApiProperty({ description: 'Start date', example: '2024-12-01' })
  @IsNotEmpty()
  from: Date;

  @ApiProperty({ description: 'End date', example: '2024-12-10' })
  @IsNotEmpty()
  to: Date;
}

export class NetDaysResponseDto {
  @ApiProperty({ description: 'Total calendar days' })
  totalDays: number;

  @ApiProperty({ description: 'Number of weekends excluded' })
  weekendsExcluded: number;

  @ApiProperty({ description: 'Number of holidays excluded' })
  holidaysExcluded: number;

  @ApiProperty({ description: 'Net working days (leave duration)' })
  netDays: number;

  @ApiProperty({
    description: 'List of holidays in the period',
    type: [String],
  })
  holidayDates: string[];
}
