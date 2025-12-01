import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmployeeStatus } from '../enums/employee-profile.enums';

/**
 * DTO for deactivating an employee profile (US-EP-05).
 * Used for termination, resignation, retirement, etc.
 */
export class DeactivateEmployeeDto {
  @ApiProperty({
    enum: [
      EmployeeStatus.TERMINATED,
      EmployeeStatus.RETIRED,
      EmployeeStatus.INACTIVE,
    ],
    description: 'New status for the employee',
  })
  @IsEnum([
    EmployeeStatus.TERMINATED,
    EmployeeStatus.RETIRED,
    EmployeeStatus.INACTIVE,
  ])
  status: EmployeeStatus;

  @ApiPropertyOptional({ description: 'Effective date of the status change' })
  @IsOptional()
  @Type(() => Date)
  effectiveDate?: Date;

  @ApiProperty({ description: 'Reason for deactivation' })
  @IsString()
  reason: string;
}
