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
    description: 'New status for the leave request',
    example: 'approved',
    enum: LeaveStatus,
  })
  @IsEnum(LeaveStatus)
  @IsNotEmpty()
  status: LeaveStatus;

  @ApiPropertyOptional({
    description: 'ID of the user making the decision',
    example: '507f1f77bcf86cd799439014',
  })
  @IsMongoId()
  @IsOptional()
  decidedBy?: string;

  @ApiPropertyOptional({
    description: 'Role of the approver (Manager, HR)',
    example: 'Manager',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  role?: string;
}
