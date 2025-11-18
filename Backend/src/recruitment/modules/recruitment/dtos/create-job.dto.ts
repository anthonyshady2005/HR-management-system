import { IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { EmploymentType } from '../schemas/job.schema';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsString()
  department: string;

  @IsString()
  location: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @IsEnum(EmploymentType)
  employmentType: EmploymentType;
}
