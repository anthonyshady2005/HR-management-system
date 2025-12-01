/**
 * # Interview – Create DTO
 *
 * DTO used to schedule new interviews.
 * Matches `Interview` schema:
 * - applicationId (required)
 * - stage (ApplicationStage, required)
 * - scheduledDate (Date)
 * - method (InterviewMethod)
 * - panel? (User[] ObjectIds)
 * - calendarEventId? / videoLink?
 * - status defaults to SCHEDULED
 */

import {
  IsMongoId,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
  IsString,
} from 'class-validator';
import { ApplicationStage } from '../enums/application-stage.enum';
import { InterviewMethod } from '../enums/interview-method.enum';

export class CreateInterviewDto {
  @IsMongoId()
  applicationId!: string;

  @IsEnum(ApplicationStage)
  stage!: ApplicationStage;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsEnum(InterviewMethod)
  method?: InterviewMethod;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  panel?: string[];

  @IsOptional()
  @IsString()
  calendarEventId?: string;

  @IsOptional()
  @IsString()
  videoLink?: string;
}
