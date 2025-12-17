import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsMongoId,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEmployeeProfileDto {
  @ApiPropertyOptional({
    description: 'First name of the employee',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name of the employee',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Work email address',
    example: 'john.doe@company.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Employment status',
    enum: ['Active', 'OnProbation', 'Suspended', 'Terminated', 'Resigned'],
  })
  @IsOptional()
  @IsEnum(['Active', 'OnProbation', 'Suspended', 'Terminated', 'Resigned'])
  employmentStatus?:
    | 'Active'
    | 'OnProbation'
    | 'Suspended'
    | 'Terminated'
    | 'Resigned';

  @ApiPropertyOptional({
    description: 'Position ID reference from Organization Structure module',
  })
  @IsOptional()
  @IsMongoId()
  positionId?: string;

  @ApiPropertyOptional({
    description: 'System roles',
    example: ['EMPLOYEE', 'MANAGER'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  systemRoles?: string[];

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Profile picture URL' })
  @IsOptional()
  @IsString()
  profilePictureUrl?: string;
}
