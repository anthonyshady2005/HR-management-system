import { IsMongoId, IsOptional, IsArray, ValidateNested, IsEnum } from "class-validator";
import { Types } from "mongoose";
import { PunchType } from "../models/enums";
import { Type } from "class-transformer";

class PunchUpdateInput {
  @IsOptional()
  @IsEnum(PunchType)
  type?: PunchType;

  @IsOptional()
  @Type(() => Date)
  time?: Date;
}

export class AttendanceRecordUpdateDTO {
  @IsOptional()
  @IsMongoId()
  employeeId?: Types.ObjectId;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PunchUpdateInput)
  punches?: PunchUpdateInput[];
}
