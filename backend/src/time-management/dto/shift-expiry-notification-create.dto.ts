import { IsMongoId, IsString } from 'class-validator';

export class CreateShiftExpiryNotificationDto {
  @IsMongoId()
  assignmentId: string;

  @IsString()
  title: string;

  @IsString()
  message: string;
}
