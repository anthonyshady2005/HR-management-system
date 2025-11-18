/**
 * # Offboarding – Create DTOs
 *
 * This file defines all **create** Data Transfer Objects (DTOs) for the
 * Offboarding module. These DTOs validate inbound payloads for:
 *
 * - Creating new `OffboardingCase` records
 * - Adding `OffboardingChecklist` tasks to a case
 * - Creating `ClearanceItem` records for assets / obligations
 * - Creating `SystemRevocation` records for system access removal
 *
 * They are consumed by Offboarding controllers and services and MUST stay
 * aligned with the Mongoose schemas in `offboarding.schema.ts`.
 */

import {
  IsMongoId,
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ExitType, 
  OffboardingDepartment,
  ChecklistStatus,
  ClearanceItemStatus,
  SystemRevocationStatus,
} from '../enums/offboarding.enums';

/**
 * CreateOffboardingCaseDto
 * ------------------------
 * Represents the payload used when an offboarding process is initiated.
 * Offboarding can be initiated by HR, a manager, or the employee.
 */
export class CreateOffboardingCaseDto {
  @ApiProperty({ 
    description: 'Employee being offboarded (MongoDB ObjectId)', 
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId()
  employeeId!: string;

  @ApiProperty({ 
    description: 'Type of exit', 
    enum: ExitType,
    example: ExitType.RESIGNATION
  })
  @IsEnum(ExitType)
  exitType!: ExitType;

  @ApiProperty({ 
    description: 'Employee\'s last working day (ISO 8601 date string)', 
    example: '2024-12-31'
  })
  @IsDateString()
  lastWorkingDay!: string;

  @ApiPropertyOptional({ 
    description: 'Reason for initiating offboarding', 
    example: 'Employee resignation'
  })
  @IsOptional()
  @IsString()
  initiationReason?: string;

  @ApiPropertyOptional({ 
    description: 'ID of the person who initiated the process (HR, manager, or employee)', 
    example: '507f1f77bcf86cd799439015'
  })
  @IsOptional()
  @IsString()
  initiatedBy?: string;
}

/**
 * CreateOffboardingChecklistItemDto
 * ---------------------------------
 * Payload for creating a new checklist task attached to an OffboardingCase.
 */
export class CreateOffboardingChecklistItemDto {
  @ApiProperty({ 
    description: 'Offboarding case ID this checklist item belongs to', 
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId()
  caseId!: string;

  @ApiProperty({ 
    description: 'Department responsible for completing this task', 
    enum: OffboardingDepartment,
    example: OffboardingDepartment.HR
  })
  @IsEnum(OffboardingDepartment)
  department!: OffboardingDepartment;

  @ApiProperty({ 
    description: 'Task description', 
    example: 'Collect laptop and access card'
  })
  @IsString()
  task!: string;

  @ApiPropertyOptional({ 
    description: 'Initial status for the checklist task', 
    enum: ChecklistStatus,
    default: ChecklistStatus.PENDING
  })
  @IsOptional()
  @IsEnum(ChecklistStatus)
  status?: ChecklistStatus;
}

/**
 * CreateClearanceItemDto
 * ----------------------
 * Payload for creating a clearance item (physical or logical asset)
 * that must be cleared/returned as part of the offboarding.
 */
export class CreateClearanceItemDto {
  @ApiProperty({ 
    description: 'Employee ID for whom the clearance item is created', 
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId()
  employeeId!: string;

  @ApiProperty({ 
    description: 'Asset or responsibility to clear', 
    example: 'Laptop'
  })
  @IsString()
  itemName!: string;

  @ApiPropertyOptional({ 
    description: 'Additional information or notes about the item', 
    example: 'MacBook Pro 16" - Serial: ABC123'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Initial return status', 
    enum: ClearanceItemStatus,
    default: ClearanceItemStatus.PENDING
  })
  @IsOptional()
  @IsEnum(ClearanceItemStatus)
  returnStatus?: ClearanceItemStatus;
}

/**
 * CreateSystemRevocationDto
 * -------------------------
 * Payload for creating a system revocation action that needs to be executed
 * as part of the offboarding (email, VPN, Jira, etc.).
 */
export class CreateSystemRevocationDto {
  @ApiProperty({ 
    description: 'Employee ID whose system access will be revoked', 
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId()
  employeeId!: string;

  @ApiProperty({ 
    description: 'Name of the system or application to revoke access from', 
    example: 'Google Workspace'
  })
  @IsString()
  systemName!: string;

  @ApiPropertyOptional({ 
    description: 'Initial revocation status', 
    enum: SystemRevocationStatus,
    default: SystemRevocationStatus.PENDING
  })
  @IsOptional()
  @IsEnum(SystemRevocationStatus)
  status?: SystemRevocationStatus;

  @ApiPropertyOptional({ 
    description: 'Timestamp when access was actually revoked (ISO 8601 string)', 
    example: '2024-12-31T23:59:59Z'
  })
  @IsOptional()
  @IsDateString()
  revokedAt?: string;
}
