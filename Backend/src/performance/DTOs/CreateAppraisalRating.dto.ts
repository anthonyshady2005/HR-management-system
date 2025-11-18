import { IsNotEmpty, IsObject, IsOptional, IsNumber, IsString } from 'class-validator';

export class CreateAppraisalRatingDto {
  @IsString()
  @IsNotEmpty()
  appraisalId: string;

  @IsObject()
  criteriaRatings: Record<string, number | string>;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsString()
  developmentRecommendations?: string;

  @IsOptional()
  @IsNumber()
  attendanceScore?: number;

  @IsOptional()
  @IsNumber()
  punctualityScore?: number;

  @IsNumber()
  overallScore: number;
}
