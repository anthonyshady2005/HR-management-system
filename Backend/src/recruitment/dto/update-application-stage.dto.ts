/**
 * # Application – Update Stage DTO
 *
 * DTO used to change the current stage of an application:
 * screening → department_interview → hr_interview → offer
 */

import { IsEnum } from 'class-validator';
import { ApplicationStage } from '../enums/application-stage.enum';

export class UpdateApplicationStageDto {
  @IsEnum(ApplicationStage)
  currentStage!: ApplicationStage;
}
