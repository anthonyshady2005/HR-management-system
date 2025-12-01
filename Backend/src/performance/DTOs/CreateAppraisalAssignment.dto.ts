import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { AppraisalAssignmentStatus } from '../enums/performance.enums';

export class CreateAppraisalAssignmentDTO {
  @ApiProperty()
  @IsString()
  cycleId: Types.ObjectId;

  @ApiProperty()
  @IsString()
  templateId: Types.ObjectId;

  @ApiProperty()
  @IsString()
  employeeProfileId: Types.ObjectId;

  @ApiProperty()
  @IsString()
  managerProfileId: Types.ObjectId;

  @ApiProperty()
  @IsString()
  departmentId: Types.ObjectId;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  positionId?: Types.ObjectId;

  @ApiPropertyOptional({ enum: AppraisalAssignmentStatus })
  @IsOptional()
  @IsEnum(AppraisalAssignmentStatus)
  status?: AppraisalAssignmentStatus;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @IsDateString()
  assignedAt?: Date;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @IsDateString()
  submittedAt?: Date;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @IsDateString()
  publishedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  latestAppraisalId?: Types.ObjectId;
}
