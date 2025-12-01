import { IsMongoId, IsOptional, IsDateString, IsEnum } from "class-validator";
import { Types } from "mongoose";
import { ShiftAssignmentStatus } from "../models/enums";

export class ShiftAssignmentUpdateDTO {
  @IsOptional()
  @IsMongoId()
  employeeId?: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  departmentId?: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  positionId?: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  shiftId?: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  scheduleRuleId?: Types.ObjectId;

  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsEnum(ShiftAssignmentStatus)
  status?: ShiftAssignmentStatus;
}
