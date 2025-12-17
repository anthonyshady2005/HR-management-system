/**
 * # Onboarding – Update Task DTO
 *
 * DTO used to update a single onboarding task for an employee.
 * The specific task can be addressed by index or an internal ID
 * depending on controller/service implementation.
 */

import {
  IsMongoId,
  IsInt,
  Min,
  IsEnum,
  IsOptional,
  IsDateString,
  IsString,
} from 'class-validator';
import { OnboardingTaskStatus } from '../enums/onboarding-task-status.enum';

export class UpdateOnboardingTaskDto {
  @IsMongoId()
  onboardingId!: string;

  /**
   * Zero-based index of the task in the onboarding.tasks array.
   */
  @IsInt()
  @Min(0)
  taskIndex!: number;

  @IsOptional()
  @IsEnum(OnboardingTaskStatus)
  status?: OnboardingTaskStatus;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsMongoId()
  documentId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
