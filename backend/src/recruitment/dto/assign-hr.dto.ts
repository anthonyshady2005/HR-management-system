/**
 * # Application – Assign HR DTO
 *
 * DTO used to assign or reassign an HR representative to an application.
 */

import { IsMongoId, IsOptional } from 'class-validator';

export class AssignHrDto {
  @IsOptional()
  @IsMongoId()
  assignedHr?: string;
}
