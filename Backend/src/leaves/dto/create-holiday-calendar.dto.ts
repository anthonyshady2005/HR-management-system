import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

class HolidayDto {
  @IsDateString()
  date: Date;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  isNational?: boolean;

  @IsBoolean()
  @IsOptional()
  isOptional?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateHolidayCalendarDto {
  @IsString()
  @IsNotEmpty()
  calendarId: string;

  @IsNumber()
  @IsNotEmpty()
  year: number;

  @IsString()
  @IsOptional()
  country?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HolidayDto)
  holidays: HolidayDto[];

  @IsArray()
  @IsNumber({}, { each: true })
  weekendDays: number[];
}