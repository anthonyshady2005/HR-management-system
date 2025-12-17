/**
 * # Application – Update Status DTO
 *
 * DTO used to change the high-level status of an application:
 * submitted → in_process → offer → hired / rejected
 */

import { IsEnum } from 'class-validator';
import { ApplicationStatus } from '../enums/application-status.enum';

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  status!: ApplicationStatus;
}
