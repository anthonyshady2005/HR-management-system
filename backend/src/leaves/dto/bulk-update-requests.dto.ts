import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsString,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveStatus } from '../enums/leave-status.enum';

export class BulkUpdateRequestsDto {
  @ApiProperty({
    description: 'Array of leave request IDs to update',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one request ID is required' })
  @IsMongoId({ each: true })
  @IsNotEmpty()
  requestIds: string[];

  @ApiProperty({
    description: 'Decision to apply to all requests (approved or rejected)',
    example: 'approved',
    enum: LeaveStatus,
  })
  @IsEnum(LeaveStatus)
  @IsNotEmpty()
  status: LeaveStatus;

  @ApiPropertyOptional({
    description: 'Role of the approval step being decided (Manager or HR)',
    example: 'HR',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  role?: string;
}

export class BulkUpdateResult {
  @ApiProperty({ description: 'Number of successfully updated requests' })
  successCount: number;

  @ApiProperty({ description: 'Number of failed updates' })
  failedCount: number;

  @ApiProperty({
    description: 'Array of successfully updated request IDs',
    type: [String],
  })
  successfulIds: string[];

  @ApiProperty({
    description: 'Array of failed updates with error messages',
    type: [Object],
  })
  failures: Array<{ requestId: string; error: string }>;
}
