/**
 * # Referral – Create DTO
 *
 * DTO used to create employee referrals.
 */

import { IsMongoId, IsString, IsOptional } from 'class-validator';

export class CreateReferralDto {
  @IsMongoId()
  referringEmployeeId!: string;

  @IsMongoId()
  candidateId!: string;

  @IsString()
  role!: string;

  @IsOptional()
  @IsString()
  level?: string;
}
