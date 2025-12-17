import { IsString, IsEnum, IsOptional, IsArray, IsBoolean, ValidateNested, IsNumber, IsMongoId } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppraisalTemplateType, AppraisalRatingScaleType } from '../enums/performance.enums';
import { Types } from 'mongoose';

class RatingScaleDto {
  @ApiProperty({ enum: AppraisalRatingScaleType })
  @IsEnum(AppraisalRatingScaleType)
  type: AppraisalRatingScaleType;

  @ApiProperty()
  @IsNumber()
  min: number;

  @ApiProperty()
  @IsNumber()
  max: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  step?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];
}

class EvaluationCriterionDto {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  details?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  required?: boolean;
}

export class CreateAppraisalTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: AppraisalTemplateType })
  @IsEnum(AppraisalTemplateType)
  templateType: AppraisalTemplateType;

  @ApiProperty({ type: RatingScaleDto })
  @ValidateNested()
  @Type(() => RatingScaleDto)
  ratingScale: RatingScaleDto;

  @ApiPropertyOptional({ type: [EvaluationCriterionDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EvaluationCriterionDto)
  criteria?: EvaluationCriterionDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableDepartmentIds?: Types.ObjectId[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicablePositionIds?: Types.ObjectId[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
