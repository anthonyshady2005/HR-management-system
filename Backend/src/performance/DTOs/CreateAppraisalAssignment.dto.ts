import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { AppraisalAssignmentStatus } from '../enums/performance.enums';

export class CreateAppraisalAssignmentDTO {
  @ApiProperty()
  @IsString()
  cycleId: string; // keep string here

  @ApiProperty()
  @IsString()
  templateId: string;

  @ApiProperty()
  @IsString()
  employeeProfileId: string;

  @ApiProperty()
  @IsString()
  managerProfileId: string;

  @ApiProperty()
  @IsString()
  departmentId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  positionId?: string;

  @ApiPropertyOptional({ enum: AppraisalAssignmentStatus })
  @IsOptional()
  @IsEnum(AppraisalAssignmentStatus)
  status?: AppraisalAssignmentStatus;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @IsDateString()
  assignedAt?: Date;
}
