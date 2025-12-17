/**
 * # Interview – Update DTO
 *
 * DTO used to update interview details:
 * - date, method, panel, links, status, feedback links, candidate feedback
 */

import {
  IsMongoId,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
  IsString,
} from 'class-validator';
import { InterviewMethod } from '../enums/interview-method.enum';
import { InterviewStatus } from '../enums/interview-status.enum';

export class UpdateInterviewDto {
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

  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;

  @IsOptional()
  @IsMongoId()
  feedbackId?: string;

  @IsOptional()
  @IsString()
  candidateFeedback?: string;
}
