import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeProfileDto {
  @ApiProperty({ description: 'Unique employee code', example: 'EMP001' })
  @IsString()
  employeeCode: string;

  @ApiProperty({ description: 'First name of the employee', example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name of the employee', example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Work email address',
    example: 'john.doe@company.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Employment status',
    enum: ['Active', 'OnProbation', 'Suspended', 'Terminated', 'Resigned'],
    default: 'Active',
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
    example: ['EMPLOYEE'],
    default: ['EMPLOYEE'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  systemRoles?: string[];

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Profile picture URL' })
  @IsOptional()
  @IsString()
  profilePictureUrl?: string;
}
