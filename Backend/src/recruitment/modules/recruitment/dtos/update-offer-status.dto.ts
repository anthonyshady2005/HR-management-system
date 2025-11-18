import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { OfferAcceptanceStatus } from '../schemas/offer-letter.schema';

export class UpdateOfferStatusDto {
  @IsEnum(OfferAcceptanceStatus)
  acceptanceStatus: OfferAcceptanceStatus;

  @IsOptional()
  @IsDateString()
  signedAt?: Date | string;
}
