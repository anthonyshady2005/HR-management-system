/**
 * DTO for updating a single clearance checklist item by department
 * Used by department users (IT, Finance, Facilities, Line Manager) to approve/reject their clearance items
 */

import { IsEnum, IsString, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApprovalStatus } from '../enums/approval-status.enum';

export class UpdateClearanceItemDto {
  @ApiProperty({
    description: 'Approval status for the clearance item',
    enum: ApprovalStatus,
    example: ApprovalStatus.APPROVED,
  })
  @IsEnum(ApprovalStatus)
  status!: ApprovalStatus;

  @ApiPropertyOptional({
    description: 'Comments or notes about the clearance approval/rejection',
    example: 'All equipment returned. System access revoked.',
  })
  @IsOptional()
  @IsString()
  comments?: string;
}

