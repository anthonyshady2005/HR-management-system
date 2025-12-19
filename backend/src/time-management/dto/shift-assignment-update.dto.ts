import { IsMongoId, IsOptional, IsDateString, IsEnum } from "class-validator";
import { ShiftAssignmentStatus } from "../models/enums";

export class ShiftAssignmentUpdateDTO {
  @IsOptional()
  @IsMongoId()
  employeeId?: string;

  @IsOptional()
  @IsMongoId()
  departmentId?: string;

  @IsOptional()
  @IsMongoId()
  positionId?: string;

  @IsOptional()
  @IsMongoId()
  shiftId?: string;

  @IsOptional()
  @IsMongoId()
  scheduleRuleId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(ShiftAssignmentStatus)
  status?: ShiftAssignmentStatus;
}
