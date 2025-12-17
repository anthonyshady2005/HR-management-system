import { IsEnum, IsDateString, IsOptional, IsString, IsBoolean } from "class-validator";
import { HolidayType } from "../models/enums";

export class HolidayUpdateDTO {
  @IsOptional()
  @IsEnum(HolidayType)
  type?: HolidayType;

  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
