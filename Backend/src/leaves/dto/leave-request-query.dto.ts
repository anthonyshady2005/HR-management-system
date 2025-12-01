import { IsOptional, IsMongoId, IsEnum, IsDateString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveStatus } from '../enums/leave-status.enum';

export class LeaveRequestQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by employee ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional({
    description: 'Filter by leave type ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  @IsOptional()
  leaveTypeId?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    example: 'pending',
    enum: LeaveStatus,
  })
  @IsEnum(LeaveStatus)
  @IsOptional()
  status?: LeaveStatus;

  @ApiPropertyOptional({
    description: 'Filter by start date (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by department ID (matches employee primaryDepartmentId)',
    example: '507f1f77bcf86cd799439099',
  })
  @IsMongoId()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'dates.from',
    enum: ['dates.from', 'createdAt'],
  })
  @IsIn(['dates.from', 'createdAt'])
  @IsOptional()
  sortBy?: 'dates.from' | 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
