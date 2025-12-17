import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateCompanySettingsDto {
  @IsDateString()
  @IsNotEmpty()
  payDate: Date;

  @IsString()
  @IsNotEmpty()
  timeZone: string;

  @IsString()
  @IsNotEmpty()
  currency: string;
}
