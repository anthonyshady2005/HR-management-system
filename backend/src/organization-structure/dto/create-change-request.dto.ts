import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StructureRequestType } from '../enums/organization-structure.enums';
import { Types } from 'mongoose';

export class CreateChangeRequestDto {
  @ApiProperty({
    description: 'Type of change request',
    enum: StructureRequestType,
    example: StructureRequestType.NEW_POSITION,
  })
  @IsNotEmpty()
  @IsEnum(StructureRequestType)
  requestType: StructureRequestType;

  @ApiPropertyOptional({
    description: 'Target department ID (for department-related requests)',
    type: String,
  })
  @IsOptional()
  @IsMongoId()
  targetDepartmentId?: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Target position ID (for position-related requests)',
    type: String,
  })
  @IsOptional()
  @IsMongoId()
  targetPositionId?: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Details of the requested change',
    example: 'Request to add a new Senior Developer position in Engineering',
  })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiPropertyOptional({
    description: 'Reason for the change request',
    example: 'Team expansion requires additional senior role',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

