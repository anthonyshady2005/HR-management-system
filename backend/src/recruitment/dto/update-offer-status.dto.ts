/**
 * # Offer – Update Response Status DTO
 *
 * DTO used to update the candidate's response to an offer:
 * accepted / rejected / pending.
 */

import { IsEnum } from 'class-validator';
import { OfferResponseStatus } from '../enums/offer-response-status.enum';

export class UpdateOfferStatusDto {
  @IsEnum(OfferResponseStatus)
  applicantResponse!: OfferResponseStatus;
}
