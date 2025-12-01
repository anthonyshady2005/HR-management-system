import { IsEmail, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

class AddressUpdateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  streetAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;
}

export class UpdateSelfEmployeeProfileDto {
  @ApiPropertyOptional({ description: 'Mobile phone number' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s\-()]{7,20}$/, {
    message: 'mobilePhone must be a valid phone number',
  })
  mobilePhone?: string;

  @ApiPropertyOptional({ description: 'Personal email address' })
  @IsOptional()
  @IsEmail()
  personalEmail?: string;

  @ApiPropertyOptional({ description: 'Address object' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressUpdateDto)
  address?: AddressUpdateDto;

  @ApiPropertyOptional({ description: 'Short biography' })
  @IsOptional()
  @IsString()
  biography?: string;

  @ApiPropertyOptional({ description: 'Profile picture URL' })
  @IsOptional()
  @IsString()
  profilePictureUrl?: string;
}
