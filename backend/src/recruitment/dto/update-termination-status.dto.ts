/**
 * # TerminationRequest – Update Status DTO
 *
 * DTO used to update the status of a termination request and
 * optionally HR comments / termination date.
 */

import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { TerminationStatus } from '../enums/termination-status.enum';

export class UpdateTerminationStatusDto {
  @IsEnum(TerminationStatus)
  status!: TerminationStatus;

  @IsOptional()
  @IsString()
  hrComments?: string;

  @IsOptional()
  @IsDateString()
  terminationDate?: string;
}
