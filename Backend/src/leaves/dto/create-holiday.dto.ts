import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HolidayType } from '../../time-management/models/enums';

export class CreateHolidayDto {
  @ApiProperty({
    description: 'Holiday type',
    enum: HolidayType,
    example: HolidayType.NATIONAL,
  })
  @IsEnum(HolidayType)
  type: HolidayType;

  @ApiProperty({
    description: 'Holiday start date (YYYY-MM-DD)',
    example: '2026-01-10',
  })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({
    description: 'Holiday end date (YYYY-MM-DD), optional',
    example: '2026-01-12',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Holiday name/label',
    example: 'Exam Blockout',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
