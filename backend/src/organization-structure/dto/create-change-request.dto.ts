import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  ValidateIf,
  IsMongoId,
} from 'class-validator';
import { Transform } from 'class-transformer';
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
    description: 'Target department ID (for department-related requests). Required for UPDATE_DEPARTMENT, optional for NEW_DEPARTMENT.',
    type: String,
  })
  @Transform(({ value, obj }) => {
    // Convert empty strings to undefined for optional fields
    // For NEW_DEPARTMENT, parent department is optional, so empty string should be treated as undefined
    if (value === '' || value === null) {
      return undefined;
    }
    return value;
  })
  @IsOptional()
  // Only validate as MongoId if:
  // 1. UPDATE_DEPARTMENT (required, so validate)
  // 2. OR if a non-empty value is provided (optional but validate format)
  @ValidateIf((o) => 
    o.requestType === StructureRequestType.UPDATE_DEPARTMENT ||
    (o.targetDepartmentId && o.targetDepartmentId !== '' && o.targetDepartmentId !== undefined && o.targetDepartmentId !== null)
  )
  @IsMongoId({ message: 'targetDepartmentId must be a valid MongoDB ObjectId' })
  targetDepartmentId?: string;

  @ApiPropertyOptional({
    description: 'Target position ID (for position-related requests). Required for UPDATE_POSITION and CLOSE_POSITION.',
    type: String,
  })
  @IsOptional()
  // Only validate as MongoId if:
  // 1. UPDATE_POSITION or CLOSE_POSITION (required, so validate)
  // 2. OR if a non-empty value is provided (optional but validate format)
  @ValidateIf((o) => 
    o.requestType === StructureRequestType.UPDATE_POSITION ||
    o.requestType === StructureRequestType.CLOSE_POSITION ||
    (o.targetPositionId && o.targetPositionId !== '')
  )
  @IsMongoId({ message: 'targetPositionId must be a valid MongoDB ObjectId' })
  targetPositionId?: string;

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

