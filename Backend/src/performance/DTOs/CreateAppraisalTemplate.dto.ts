import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateAppraisalTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  ratingScale: string;

  @IsString()
  @IsNotEmpty()
  createdBy: string; // ObjectId
}
