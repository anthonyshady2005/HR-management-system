import {
  IsString,
  IsMongoId,
  IsOptional,
  IsArray,
  IsObject,
  IsDateString,
} from 'class-validator';

export class ScheduleInterviewDto {
  @IsMongoId()
  candidateId: string;

  @IsMongoId()
  jobId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  panel?: string[];

  @IsOptional()
  @IsObject()
  scores?: Record<string, number>;

  @IsOptional()
  @IsString()
  structuredFeedback?: string;

  @IsDateString()
  scheduledAt: Date | string;
}
