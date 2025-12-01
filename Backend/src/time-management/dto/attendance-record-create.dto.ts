import { IsMongoId, IsOptional, IsArray, ValidateNested, IsEnum} from "class-validator";
import { Types } from "mongoose";
import { PunchType } from "../models/enums";
import { Type } from "class-transformer";

class PunchInput {
  @IsEnum(PunchType)
  type: PunchType;

  @Type(() => Date)
  time: Date;
}

export class AttendanceRecordCreateDTO {
  @IsMongoId()
  employeeId: Types.ObjectId;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PunchInput)
  punches?: PunchInput[];
}
