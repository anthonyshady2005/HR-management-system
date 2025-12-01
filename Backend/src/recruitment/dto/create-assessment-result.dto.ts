/**
 * # AssessmentResult – Create DTO
 *
 * DTO used to submit assessment results / interview feedback:
 * - interviewId (required)
 * - interviewerId (required)
 * - score (number)
 * - comments? (string)
 */

import { IsMongoId, IsNumber, IsOptional, IsString} from 'class-validator';

export class CreateAssessmentResultDto {
  @IsMongoId()
  interviewId!: string;

  @IsMongoId()
  interviewerId!: string;

  @IsNumber()
  score!: number;

  @IsOptional()
  @IsString()
  comments?: string;
}
