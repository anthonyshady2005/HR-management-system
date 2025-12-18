/**
 * # TerminationRequest – Create DTO
 *
 * DTO used to create termination requests.
 * Matches `TerminationRequest` schema.
 */

import {
  IsMongoId,
  IsEnum,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { TerminationInitiation } from '../enums/termination-initiation.enum';

export class CreateTerminationRequestDto {
  @IsMongoId()
  employeeId!: string;

  @IsEnum(TerminationInitiation)
  initiator!: TerminationInitiation;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  employeeComments?: string;

  @IsOptional()
  @IsString()
  hrComments?: string;

  @IsOptional()
  @IsDateString()
  terminationDate?: string;

  @IsMongoId()
  contractId!: string;
}
