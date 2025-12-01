/**
 * # Onboarding – Create DTO
 *
 * DTO used to initialize an onboarding process and its tasks.
 * Matches `Onboarding` schema: employeeId + tasks[].
 */

import {
  IsMongoId,
  IsOptional,
  IsBoolean,
  IsArray,
  IsString,
  IsEnum,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OnboardingTaskStatus } from '../enums/onboarding-task-status.enum';

export class OnboardingTaskDto {
  @IsString()
  name!: string;

  @IsString()
  department!: string;

  @IsOptional()
  @IsEnum(OnboardingTaskStatus)
  status?: OnboardingTaskStatus;

  @IsOptional()
  @IsDateString()
  deadline?: string;

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

export class CreateOnboardingDto {
  @IsMongoId()
  employeeId!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OnboardingTaskDto)
  tasks?: OnboardingTaskDto[];

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsDateString()
  completedAt?: string;
}
