import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStage } from '../schemas/application.schema';

export class UpdateApplicationStageDto {
  @IsEnum(ApplicationStage)
  stage: ApplicationStage;

  @IsOptional()
  @IsString()
  comment?: string;
}
