import { IsBoolean, IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateConsentDto {
  @IsMongoId()
  applicationId!: string;

  @IsBoolean()
  consentGiven!: boolean;

  @IsString()
  consentType!: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}

