import { IsMongoId, IsString, IsOptional } from "class-validator";
import { Types } from "mongoose";

export class NotificationLogUpdateDTO {
  @IsOptional()
  @IsMongoId()
  to?: Types.ObjectId;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
