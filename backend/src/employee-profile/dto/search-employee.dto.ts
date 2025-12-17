import {
  IsOptional,
  IsString,
  IsMongoId,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchEmployeeDto {
  @ApiPropertyOptional({ description: 'Search by name (first, last, or full)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Search by employee number' })
  @IsOptional()
  @IsString()
  employeeNumber?: string;

  @ApiPropertyOptional({ description: 'Filter by department ID' })
  @IsOptional()
  @IsMongoId()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Filter by position ID' })
  @IsOptional()
  @IsMongoId()
  positionId?: string;

  @ApiPropertyOptional({ description: 'Filter by employee status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}
