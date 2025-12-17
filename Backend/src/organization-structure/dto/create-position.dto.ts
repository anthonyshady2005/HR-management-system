import { IsNotEmpty, IsOptional, IsString, IsEnum, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePositionDto {
  @ApiProperty({ description: 'Position title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Unique position code' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ description: 'Department ObjectId' })
  @IsNotEmpty()
  @IsMongoId()
  departmentId: Types.ObjectId;

  @ApiPropertyOptional({ description: 'Reports to another position ObjectId', type: String })
  @IsOptional()
  @IsMongoId()
  reportsTo?: Types.ObjectId;

  @ApiPropertyOptional({ description: 'Status', enum: ['active', 'inactive'], default: 'active' })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status: 'active' | 'inactive' = 'active';

  @ApiPropertyOptional({ 
    description: 'Pay grade ID associated with this position', 
    type: String 
  })
  @IsOptional()
  @IsMongoId()
  payGradeId?: string;
}
