import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProfileChangeStatus } from '../enums/employee-profile.enums';

/**
 * DTO for HR Admin to approve or reject a change request (US-E2-03).
 */
export class ProcessChangeRequestDto {
  @ApiProperty({
    enum: [ProfileChangeStatus.APPROVED, ProfileChangeStatus.REJECTED],
    description: 'New status for the change request',
  })
  @IsEnum([ProfileChangeStatus.APPROVED, ProfileChangeStatus.REJECTED])
  status: ProfileChangeStatus.APPROVED | ProfileChangeStatus.REJECTED;

  @ApiPropertyOptional({ description: 'Comments or reason for the decision' })
  @IsOptional()
  @IsString()
  comments?: string;
}
