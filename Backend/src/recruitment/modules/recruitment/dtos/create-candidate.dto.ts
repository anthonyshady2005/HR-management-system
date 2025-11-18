import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsBoolean,
  IsMongoId,
  IsEnum,
} from 'class-validator';
import { CandidateStage } from '../schemas/candidate.schema';

export class CreateCandidateDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  resumeURL?: string;

  @IsOptional()
  @IsBoolean()
  consentFlag?: boolean;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  appliedJobs?: string[];

  @IsOptional()
  @IsEnum(CandidateStage)
  currentStage?: CandidateStage;
}
