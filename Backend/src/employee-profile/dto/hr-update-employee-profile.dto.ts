/* eslint-disable prettier/prettier */
import {
  IsString,
  IsOptional,
  IsEnum,
  IsMongoId,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  EmployeeStatus,
  ContractType,
  WorkType,
  Gender,
  MaritalStatus,
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
 * DTO for HR Admin to update any field of an employee profile (US-EP-04).
 * BR 20a: Only authorized roles (HR Admin) can modify this data.
 */
export class HrUpdateEmployeeProfileDto {
  // Personal Information
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  dateOfBirth?: Date;

  // Contact Information
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  personalEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobilePhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  homePhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profilePictureUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  biography?: string;

  // Employment Information (BR 3b, 3f, 3g)
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  dateOfHire?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  contractStartDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  contractEndDate?: Date;

  @ApiPropertyOptional({ enum: ContractType })
  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @ApiPropertyOptional({ enum: WorkType })
  @IsOptional()
  @IsEnum(WorkType)
  workType?: WorkType;

  @ApiPropertyOptional({ enum: EmployeeStatus })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  statusEffectiveFrom?: Date;

  // Organizational Links
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  primaryPositionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  primaryDepartmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  supervisorPositionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  payGradeId?: string;

  // Reason for change (for audit trail)
  @ApiPropertyOptional({
    description: 'Reason for this update (for audit trail)',
  })
  @IsOptional()
  @IsString()
  changeReason?: string;
}
