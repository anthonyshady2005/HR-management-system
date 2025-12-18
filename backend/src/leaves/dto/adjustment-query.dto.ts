import { IsOptional, IsMongoId, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AdjustmentType } from '../enums/adjustment-type.enum';

export class AdjustmentQueryDto {
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
    description: 'Filter by adjustment type',
    example: 'add',
    enum: AdjustmentType,
  })
  @IsEnum(AdjustmentType)
  @IsOptional()
  adjustmentType?: AdjustmentType;
}
