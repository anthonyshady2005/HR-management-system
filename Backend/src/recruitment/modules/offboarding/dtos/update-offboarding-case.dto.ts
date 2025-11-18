/**
 * # Offboarding – Update / Status DTOs
 *
 * This file defines all **update** DTOs for the Offboarding module.
 * They represent focused PATCH/PUT payloads that:
 *
 * - Change the status of an `OffboardingCase`
 * - Update the status of an `OffboardingChecklist` task
 * - Update the `returnStatus` of a `ClearanceItem`
 * - Update the `status` and optional `revokedAt` timestamp of a `SystemRevocation`
 *
 * Each DTO is intentionally small and explicit so the public API surface is
 * easy to reason about and simple to validate.
 */

import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  OffboardingStatus,
  ChecklistStatus,
  ClearanceItemStatus,
  SystemRevocationStatus,
} from '../enums/offboarding.enums'; 

/**
 * UpdateOffboardingStatusDto
 * --------------------------
 * Used to advance or modify the status of an OffboardingCase:
 * INITIATED → CLEARANCE_IN_PROGRESS → COMPLETED / CANCELLED.
 */
export class UpdateOffboardingStatusDto {
  @ApiProperty({ 
    description: 'New offboarding case status', 
    enum: OffboardingStatus,
    example: OffboardingStatus.CLEARANCE_IN_PROGRESS
  })
  @IsEnum(OffboardingStatus)
  status!: OffboardingStatus;
}

/**
 * UpdateOffboardingChecklistItemStatusDto
 * ---------------------------------------
 * Used to update the lifecycle status of a checklist task:
 * PENDING → IN_PROGRESS → COMPLETED.
 */
export class UpdateOffboardingChecklistItemStatusDto {
  @ApiProperty({ 
    description: 'New checklist task status', 
    enum: ChecklistStatus,
    example: ChecklistStatus.IN_PROGRESS
  })
  @IsEnum(ChecklistStatus)
  status!: ChecklistStatus;
}

/**
 * UpdateClearanceItemStatusDto
 * ----------------------------
 * Used to update the returnStatus of a clearance item:
 * PENDING → RETURNED / LOST.
 */
export class UpdateClearanceItemStatusDto {
  @ApiProperty({ 
    description: 'New return status for the clearance item', 
    enum: ClearanceItemStatus,
    example: ClearanceItemStatus.RETURNED
  })
  @IsEnum(ClearanceItemStatus)
  returnStatus!: ClearanceItemStatus;
}

/**
 * UpdateSystemRevocationStatusDto
 * -------------------------------
 * Used to update the revocation status of a system access record and,
 * optionally, capture the timestamp when revocation actually happened.
 */
export class UpdateSystemRevocationStatusDto {
  @ApiProperty({ 
    description: 'New revocation status', 
    enum: SystemRevocationStatus,
    example: SystemRevocationStatus.REVOKED
  })
  @IsEnum(SystemRevocationStatus)
  status!: SystemRevocationStatus;

  @ApiPropertyOptional({ 
    description: 'Timestamp when access was actually revoked (ISO 8601 string)', 
    example: '2024-12-31T23:59:59Z'
  })
  @IsOptional()
  @IsDateString()
  revokedAt?: string;
}
