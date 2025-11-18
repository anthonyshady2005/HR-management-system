/**
 * DTO: UpdateOnboardingCaseDto
 * -------------------------------------------
 * Represents the payload for updating an existing onboarding case.
 * All fields are optional to allow partial updates.
 *
 * Fields:
 * - employeeId?: string
 *      Optional employee identifier linked to the onboarding case.
 *
 * - candidateId?: string
 *      Optional candidate identifier associated with the onboarding process.
 *
 * - jobId?: string
 *      Optional job identifier for the assigned role.
 *
 * - contractSignDate?: Date
 *      Optional date when the employee/candidate signed the contract.
 *
 * - startDate?: Date
 *      Optional date when the employee is expected to start.
 *
 * - status?: OnboardingStatus
 *      Optional current onboarding status (enum).
 *
 * - checklist?: OnboardingTaskDto[]
 *      Optional list of onboarding tasks. Each task follows the OnboardingTaskDto structure.
 *
 * - documentUrls?: string[]
 *      Optional array of document URLs uploaded or linked during onboarding.
 *
 * - employeeProfile?: Record<string, any>
 *      Optional object storing employee profile information (dynamic key/value pairs).
 *
 * - resourceProvisioning?: Record<string, any>
 *      Optional object describing resources provisioned to the employee (e.g., laptop, software access).
 *
 * Validation:
 * - Uses class-validator decorators to ensure incoming data adheres to expected formats.
 * - All fields are optional to support PATCH-style requests.
 *
 * extra changes
 * * DTO: CreateOnboardingCaseDto
 * ----------------------------------------------------
 * Defines the required payload for creating a new onboarding case.
 * Used when a candidate accepts an offer and an onboarding process begins.
 *
 * Properties:
 * - employeeId: string (MongoId)
 *      The employee (or future employee) linked to this onboarding case.
 *
 * - startDate: Date | string
 *      The expected start date for the employee.
 *
 * - status?: OnboardingStatus
 *      Optional onboarding status. Defaults to PENDING in the schema.
 *
 * - checklistTemplateId?: string
 *      Optional ID of a predefined checklist template to auto-generate tasks.
 *
 * Validation:
 * - Ensures fields match schema rules.
 * - Used in controllers for onboarding case creation.
 */

import {
  IsMongoId,
  IsDateString,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDate,
  IsArray,
  IsObject,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OnboardingStatus } from '../schemas/onboarding-case.schema';

export class OnboardingTaskDto {
  @ApiProperty({ description: 'Task title', example: 'Complete background check' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Task description', example: 'Verify candidate credentials' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Task due date', type: Date, example: '2024-12-31' })
  @IsDate()
  @IsOptional()
  dueDate?: Date;

  @ApiPropertyOptional({ description: 'Person assigned to the task', example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsOptional()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Department responsible for the task', example: 'HR' })
  @IsString()
  @IsOptional()
  department?: string;
}

export class CreateOnboardingCaseDto {
  @ApiProperty({ description: 'Employee ID (MongoDB ObjectId)', example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiPropertyOptional({ description: 'Candidate ID associated with onboarding', example: '507f1f77bcf86cd799439012' })
  @IsString()
  @IsOptional()
  candidateId?: string;

  @ApiPropertyOptional({ description: 'Job ID for the assigned role', example: '507f1f77bcf86cd799439013' })
  @IsString()
  @IsOptional()
  jobId?: string;

  @ApiProperty({ description: 'Contract signing date', type: Date, example: '2024-01-15' })
  @IsDate()
  @IsNotEmpty()
  contractSignDate: Date;

  @ApiPropertyOptional({ description: 'Employee start date', type: Date, example: '2024-02-01' })
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ 
    description: 'Onboarding status', 
    enum: OnboardingStatus,
    default: OnboardingStatus.PENDING,
    example: OnboardingStatus.PENDING
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
    example: ['https://example.com/doc1.pdf', 'https://example.com/doc2.pdf']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documentUrls?: string[];

  @ApiPropertyOptional({ 
    description: 'Employee profile information (dynamic key/value pairs)',
    example: { position: 'Software Engineer', department: 'IT' }
  })
  @IsObject()
  @IsOptional()
  employeeProfile?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Resource provisioning details (e.g., laptop, software access)',
    example: { laptop: true, email: true, vpn: true }
  })
  @IsObject()
  @IsOptional()
  resourceProvisioning?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Checklist template ID to auto-generate tasks', 
    example: '507f1f77bcf86cd799439014'
  })
  @IsMongoId()
  @IsOptional()
  checklistTemplateId?: string;
}
