/**
 * # JobTemplate – Update DTO
 *
 * DTO used to update existing job templates.
 * All fields are optional (partial update / PATCH).
 */

import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateJobTemplateDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  qualifications?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  description?: string;
}
