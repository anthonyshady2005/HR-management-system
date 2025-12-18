/**
 * # Offer – Update Final Approval DTO
 *
 * DTO used to update the final approval status of an offer
 * (HR / management approval workflow).
 */

import { IsEnum } from 'class-validator';
import { OfferFinalStatus } from '../enums/offer-final-status.enum';

export class UpdateOfferApprovalDto {
  @IsEnum(OfferFinalStatus)
  finalStatus!: OfferFinalStatus;
}
