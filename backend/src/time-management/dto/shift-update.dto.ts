import { IsString, IsMongoId, IsEnum, IsInt, Min, IsBoolean, IsOptional } from "class-validator";
import { Types } from "mongoose";
import { PunchPolicy } from "../models/enums";

export class ShiftUpdateDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsMongoId()
  shiftType?: Types.ObjectId;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsEnum(PunchPolicy)
  punchPolicy?: PunchPolicy;

  @IsOptional()
  @IsInt()
  @Min(0)
  graceInMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  graceOutMinutes?: number;

  @IsOptional()
  @IsBoolean()
  requiresApprovalForOvertime?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
