import { IsNotEmpty, IsOptional, IsString, IsEnum, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Department name' })
  @IsNotEmpty()
  @IsString()
  dep_name: string;

  @ApiPropertyOptional({ description: 'Parent department code', type: String })
  @IsOptional()
  @IsString()
  parent_dep_code?: string;

  @ApiProperty({ description: 'Unique department code' })
  @IsNotEmpty()
  @IsString()
  dep_code: string;

  @ApiPropertyOptional({ 
    description: 'Status of the department', 
    enum: ['active', 'inactive'], 
    default: 'active' 
  })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status: 'active' | 'inactive' = 'active';

  @ApiPropertyOptional({ 
    description: 'ID of the position that serves as department head', 
    type: String 
  })
  @IsOptional()
  @IsMongoId()
  headPositionId?: string;
}
