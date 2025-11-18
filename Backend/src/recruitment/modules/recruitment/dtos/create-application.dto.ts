import { IsString, IsMongoId, IsOptional, IsEnum } from 'class-validator';
import { ApplicationStage } from '../schemas/application.schema';

export class CreateApplicationDto {
  @IsMongoId()
  jobId: string;

  @IsMongoId()
  candidateId: string;

  @IsOptional()
  @IsEnum(ApplicationStage)
  stage?: ApplicationStage;

  @IsOptional()
  @IsString()
  comments?: string;
}
