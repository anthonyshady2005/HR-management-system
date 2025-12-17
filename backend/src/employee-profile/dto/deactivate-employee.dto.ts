import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeactivationReason } from '../enums/employee-profile.enums';

/**
 * DTO for deactivating (permanently deleting) an employee profile (US-EP-05).
 * Used for termination, resignation, retirement, or account removal.
 */
export class DeactivateEmployeeDto {
  @ApiProperty({
    enum: DeactivationReason,
    description: 'Reason for deactivation/deletion',
  })
  @IsEnum(DeactivationReason)
  deactivationReason: DeactivationReason;

  @ApiPropertyOptional({ description: 'Effective date of the deactivation' })
  @IsOptional()
  @Type(() => Date)
  effectiveDate?: Date;

  @ApiProperty({ description: 'Additional notes about the deactivation' })
  @IsString()
  notes: string;
}
