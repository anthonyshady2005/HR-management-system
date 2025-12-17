import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveStatus } from '../enums/leave-status.enum';

export class UpdateLeaveRequestStatusDto {
  @ApiProperty({
    description: `Decision for the approval step (approved or rejected).

IMPORTANT: This represents the decision for the INDIVIDUAL approval step (Manager or HR), NOT the overall request status.

The overall request status will be automatically calculated:
- If ANY step is rejected → Overall status = REJECTED (final)
- If ALL steps are approved → Overall status = APPROVED (final)
- Otherwise → Overall status = PENDING (waiting for remaining approvals)

Examples:
- Manager approves: Manager step = approved, Request status stays PENDING until HR also approves
- HR rejects: HR step = rejected, Request status becomes REJECTED (final)
- Both approve: Both steps = approved, Request status becomes APPROVED (final)`,
    example: 'approved',
    enum: LeaveStatus,
  })
  @IsEnum(LeaveStatus)
  @IsNotEmpty()
  status: LeaveStatus;

  @ApiPropertyOptional({
    description: 'ID of the user making the decision (auto-populated from JWT token)',
    example: '507f1f77bcf86cd799439014',
  })
  @IsMongoId()
  @IsOptional()
  decidedBy?: string;

  @ApiPropertyOptional({
    description: 'Role of the approval step being decided (Manager or HR). Required when updating approval status.',
    example: 'Manager',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  role?: string;
}
