import { IsDate, IsEnum, IsNotEmpty, IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppraisalTemplateType, AppraisalCycleStatus } from '../enums/performance.enums';
import { Types } from 'mongoose';

class CycleTemplateAssignmentDTO {
  @ApiProperty({ description: 'Template ID' })
  @IsString()
  templateId: string;

  @ApiProperty({ description: 'Departments assigned to this template', type: [String] })
  @IsArray()
  @IsString({ each: true })
  departmentIds: string[];
}

export class CreateAppraisalCycleDTO {
  @ApiProperty({ description: 'Name of the appraisal cycle' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the cycle' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: AppraisalTemplateType })
  @IsEnum(AppraisalTemplateType)
  cycleType: AppraisalTemplateType;

  @ApiProperty({ type: Date })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ type: Date })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  managerDueDate?: Date;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  employeeAcknowledgementDueDate?: Date;

  @ApiPropertyOptional({ type: [CycleTemplateAssignmentDTO] })
  @ValidateNested({ each: true })
  @Type(() => CycleTemplateAssignmentDTO)
  @IsOptional()
  @IsArray()
  templateAssignments?: CycleTemplateAssignmentDTO[];

  @ApiPropertyOptional({ enum: AppraisalCycleStatus })
  @IsEnum(AppraisalCycleStatus)
  @IsOptional()
  status?: AppraisalCycleStatus;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  archivedAt?: Date;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  publishedAt?: Date;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  closedAt?: Date;
}
