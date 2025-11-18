/**
 * DTO: UpdateOnboardingCaseDto
 * ----------------------------------------------------
 * Defines the structure for updating an onboarding case.
 * All fields are optional to allow partial updates to
 * existing onboarding case records.
 *
 * Properties:
 *
 * - employeeId?: string
 *      Optional identifier of the employee linked to the onboarding case.
 *
 * - candidateId?: string
 *      Optional identifier of the candidate associated with the onboarding flow.
 *
 * - jobId?: string
 *      Optional job posting/position identifier.
 *
 * - contractSignDate?: Date
 *      Optional date indicating when the contract was signed.
 *
 * - startDate?: Date
 *      Optional start date for the employee.
 *
 * - status?: OnboardingStatus
 *      Optional onboarding status value (enum).
 *
 * - checklist?: OnboardingTaskDto[]
 *      Optional array of onboarding tasks, each represented by OnboardingTaskDto.
 *
 * - documentUrls?: string[]
 *      Optional list of URLs pointing to documents uploaded during onboarding.
 *
 * - employeeProfile?: Record<string, any>
 *      Optional dynamic object containing employee-related profile data.
 *
 * - resourceProvisioning?: Record<string, any>
 *      Optional object representing assigned resources (e.g., hardware, accounts).
 *
 * Validation:
 * - Uses class-validator decorators for type validation.
 * - All properties use `@IsOptional()` to support PATCH-style updates.
 */

import {
  IsString,
  IsOptional,
  IsEnum,
  IsDate,
  IsArray,
  IsObject,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OnboardingStatus } from '../schemas/onboarding-case.schema';
import { OnboardingTaskDto } from './create-onboarding-case.dto';

export class UpdateOnboardingCaseDto {
  @ApiPropertyOptional({ description: 'Employee ID linked to the onboarding case', example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'Candidate ID associated with onboarding', example: '507f1f77bcf86cd799439012' })
  @IsString()
  @IsOptional()
  candidateId?: string;

  @ApiPropertyOptional({ description: 'Job ID for the assigned role', example: '507f1f77bcf86cd799439013' })
  @IsString()
  @IsOptional()
  jobId?: string;

  @ApiPropertyOptional({ description: 'Contract signing date', type: Date, example: '2024-01-15' })
  @IsDate()
  @IsOptional()
  contractSignDate?: Date;

  @ApiPropertyOptional({ description: 'Employee start date', type: Date, example: '2024-02-01' })
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ 
    description: 'Onboarding status', 
    enum: OnboardingStatus,
    example: OnboardingStatus.IN_PROGRESS
  })
  @IsEnum(OnboardingStatus)
  @IsOptional()
  status?: OnboardingStatus;

  @ApiPropertyOptional({ 
    description: 'List of onboarding tasks', 
    type: [OnboardingTaskDto],
    isArray: true
  })
  @IsArray()
  @IsOptional()
  checklist?: OnboardingTaskDto[];

  @ApiPropertyOptional({ 
    description: 'Array of document URLs', 
    type: [String],
    example: ['https://example.com/doc1.pdf']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documentUrls?: string[];

  @ApiPropertyOptional({ 
    description: 'Employee profile information (dynamic key/value pairs)',
    example: { position: 'Software Engineer' }
  })
  @IsObject()
  @IsOptional()
  employeeProfile?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Resource provisioning details',
    example: { laptop: true, email: true }
  })
  @IsObject()
  @IsOptional()
  resourceProvisioning?: Record<string, any>;
}
