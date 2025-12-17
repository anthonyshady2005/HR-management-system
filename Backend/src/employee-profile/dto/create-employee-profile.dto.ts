import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsMongoId,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EmployeeStatus,
  ContractType,
  WorkType,
  Gender,
  MaritalStatus,
  PayGrade,
} from '../enums/employee-profile.enums';

class AddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  streetAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;
}

/**
 * DTO for HR Admin to create a new employee profile.
 * Creates employee and optionally assigns to a team via supervisorPositionId.
 */
export class CreateEmployeeProfileDto {
  // Required fields
  @ApiProperty({ description: 'First name of the employee', example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name of the employee', example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Date of hire',
    example: '2024-01-15',
  })
  @IsDateString()
  dateOfHire: string;

  // Personal Information
  @ApiPropertyOptional({ description: 'Middle name' })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiPropertyOptional({ description: 'National ID' })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiPropertyOptional({ description: 'Gender', enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Marital status', enum: MaritalStatus })
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @ApiPropertyOptional({ description: 'Date of birth', example: '1990-01-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  // Contact Information
  @ApiPropertyOptional({
    description: 'Personal email address',
    example: 'john.doe@personal.com',
  })
  @IsOptional()
  @IsEmail()
  personalEmail?: string;

  @ApiProperty({
    description: 'Work email address',
    example: 'john.doe@company.com',
  })
  @IsEmail()
  workEmail: string;

  @ApiPropertyOptional({ description: 'Mobile phone number' })
  @IsOptional()
  @IsString()
  mobilePhone?: string;

  @ApiPropertyOptional({ description: 'Home phone number' })
  @IsOptional()
  @IsString()
  homePhone?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional({ description: 'Profile picture URL' })
  @IsOptional()
  @IsString()
  profilePictureUrl?: string;

  @ApiPropertyOptional({ description: 'Biography' })
  @IsOptional()
  @IsString()
  biography?: string;

  // Employment Information
  @ApiPropertyOptional({
    description: 'Employee number (auto-generated if not provided)',
    example: 'EMP001',
  })
  @IsOptional()
  @IsString()
  employeeNumber?: string;

  @ApiPropertyOptional({
    description: 'Employment status',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  // Organization Structure
  @ApiPropertyOptional({
    description: 'Primary position ID (from Organization Structure)',
  })
  @IsOptional()
  @IsMongoId()
  primaryPositionId?: string;

  @ApiPropertyOptional({
    description: 'Primary department ID (from Organization Structure)',
  })
  @IsOptional()
  @IsMongoId()
  primaryDepartmentId?: string;

  @ApiPropertyOptional({
    description: 'Supervisor position ID (assigns employee to manager team)',
  })
  @IsOptional()
  @IsMongoId()
  supervisorPositionId?: string;

  @ApiPropertyOptional({
    description: 'Pay grade ID',
    enum: PayGrade,
  })
  @IsOptional()
  @IsEnum(PayGrade)
  payGradeId?: string;

  @ApiPropertyOptional({ description: 'Job title' })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  // Contract Information
  @ApiPropertyOptional({ description: 'Contract start date', example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  contractStartDate?: string;

  @ApiPropertyOptional({ description: 'Contract end date', example: '2025-01-14' })
  @IsOptional()
  @IsDateString()
  contractEndDate?: string;

  @ApiPropertyOptional({ description: 'Contract type', enum: ContractType })
  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @ApiPropertyOptional({ description: 'Work type', enum: WorkType })
  @IsOptional()
  @IsEnum(WorkType)
  workType?: WorkType;
}
