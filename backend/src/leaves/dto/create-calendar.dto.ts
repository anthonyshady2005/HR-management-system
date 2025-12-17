import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class BlockedPeriodDto {
  @ApiProperty({
    description: 'Start date of blocked period',
    example: '2024-12-20',
  })
  @IsNotEmpty()
  from: Date;

  @ApiProperty({
    description: 'End date of blocked period',
    example: '2024-12-31',
  })
  @IsNotEmpty()
  to: Date;

  @ApiProperty({
    description: 'Reason for blocking this period',
    example: 'Year-end closing',
  })
  @IsNotEmpty()
  reason: string;
}

export class CreateCalendarDto {
  @ApiProperty({ description: 'Calendar year', example: 2024 })
  @IsNotEmpty()
  @IsNumber()
  year: number;

  @ApiPropertyOptional({
    description: 'Array of holiday IDs from Time Management module',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  holidays?: string[];

  @ApiPropertyOptional({
    description: 'Blocked periods where leave requests are not allowed',
    type: [BlockedPeriodDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockedPeriodDto)
  blockedPeriods?: BlockedPeriodDto[];
}
