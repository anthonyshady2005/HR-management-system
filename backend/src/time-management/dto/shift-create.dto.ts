import { IsString, IsMongoId, IsEnum, IsInt, Min, IsBoolean, IsOptional } from "class-validator";
import { Types } from "mongoose";
import { PunchPolicy } from "../models/enums";

export class ShiftCreateDTO {
  @IsString()
  name: string;

  @IsMongoId()
  shiftType: Types.ObjectId;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsEnum(PunchPolicy)
  punchPolicy: PunchPolicy;

  @IsInt()
  @Min(0)
  graceInMinutes: number;

  @IsInt()
  @Min(0)
  graceOutMinutes: number;

  @IsOptional()
  @IsBoolean()
  requiresApprovalForOvertime?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
