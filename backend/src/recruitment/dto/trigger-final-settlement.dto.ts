/**
 * # Trigger Final Settlement DTO
 *
 * DTO used for HR Manager to trigger final settlement (OFF-013)
 */

import {
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TriggerFinalSettlementDto {
  @ApiPropertyOptional({
    description: 'Comments or notes about the settlement',
  })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({
    description: 'Effective date for the settlement (defaults to termination date)',
  })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiPropertyOptional({
    description: 'Whether to process leave settlement',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  processLeaveSettlement?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to process termination benefits',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  processTerminationBenefits?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to terminate benefits',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  terminateBenefits?: boolean;
}
