import {
  IsString,
  IsMongoId,
  IsOptional,
  IsObject,
  IsNumber,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { OfferAcceptanceStatus } from '../schemas/offer-letter.schema';

export class CreateOfferLetterDto {
  @IsMongoId()
  candidateId: string;

  @IsMongoId()
  jobId: string;

  @IsOptional()
  @IsObject()
  jobDetails?: Record<string, any>;

  @IsNumber()
  salary: number;

  @IsOptional()
  @IsString()
  benefits?: string;

  @IsOptional()
  @IsEnum(OfferAcceptanceStatus)
  acceptanceStatus?: OfferAcceptanceStatus;

  @IsOptional()
  @IsDateString()
  signedAt?: Date | string;
}
