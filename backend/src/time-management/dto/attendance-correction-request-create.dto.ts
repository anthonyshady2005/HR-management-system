import { IsMongoId, IsOptional, IsString, IsEnum } from "class-validator";
import { Types } from "mongoose";
import { CorrectionRequestStatus } from "../models/enums";

export class AttendanceCorrectionRequestCreateDTO {
  @IsMongoId()
  employeeId: Types.ObjectId;

  @IsMongoId()
  attendanceRecord: Types.ObjectId;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsEnum(CorrectionRequestStatus)
  status?: CorrectionRequestStatus;
}
