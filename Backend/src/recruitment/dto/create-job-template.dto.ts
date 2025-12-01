/**
 * # JobTemplate – Create DTO
 *
 * DTO used to create new reusable job templates.
 * Matches `JobTemplate` schema:
 * - title (required)
 * - department (required)
 * - qualifications (string[])
 * - skills (string[])
 * - description? (string)
 */

import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateJobTemplateDto {
  @IsString()
  title!: string;

  @IsString()
  department!: string;

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
