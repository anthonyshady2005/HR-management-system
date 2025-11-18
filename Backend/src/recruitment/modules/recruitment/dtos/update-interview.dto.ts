import {
  IsOptional,
  IsArray,
  IsString,
  IsObject,
  IsDateString,
} from 'class-validator';

export class UpdateInterviewDto {
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

  @IsOptional()
  @IsDateString()
  scheduledAt?: Date | string;
}
