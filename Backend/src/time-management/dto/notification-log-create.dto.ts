import { IsMongoId, IsString, IsOptional } from "class-validator";
import { Types } from "mongoose";

export class NotificationLogCreateDTO {
  @IsMongoId()
  to: Types.ObjectId;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  message?: string;
}
