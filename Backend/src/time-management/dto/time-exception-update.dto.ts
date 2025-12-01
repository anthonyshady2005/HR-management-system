import { IsMongoId, IsEnum, IsString, IsOptional } from "class-validator";
import { Types } from "mongoose";
import { TimeExceptionType, TimeExceptionStatus } from "../models/enums";

export class TimeExceptionUpdateDTO {
  @IsOptional()
  @IsMongoId()
  employeeId?: Types.ObjectId;

  @IsOptional()
  @IsEnum(TimeExceptionType)
  type?: TimeExceptionType;

  @IsOptional()
  @IsMongoId()
  attendanceRecordId?: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  assignedTo?: Types.ObjectId;

  @IsOptional()
  @IsEnum(TimeExceptionStatus)
  status?: TimeExceptionStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
