import { IsMongoId, IsEnum, IsString, IsOptional } from "class-validator";
import { Types } from "mongoose";
import { TimeExceptionType, TimeExceptionStatus } from "../models/enums";

export class TimeExceptionCreateDTO {
  @IsMongoId()
  employeeId: Types.ObjectId;

  @IsEnum(TimeExceptionType)
  type: TimeExceptionType;

  @IsMongoId()
  attendanceRecordId: Types.ObjectId;

  @IsMongoId()
  assignedTo: Types.ObjectId;

  @IsOptional()
  @IsEnum(TimeExceptionStatus)
  status?: TimeExceptionStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
