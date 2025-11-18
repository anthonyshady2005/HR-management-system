import { IsDateString, IsNotEmpty, IsObject, IsString, IsEnum } from 'class-validator';

export class CreateEmployeeAppraisalHistoryDto {
  @IsString()
  employeeId: string;

  @IsString()
  cycleId: string;

  @IsString()
  templateId: string;

  @IsString()
  ratingId: string;

  @IsNotEmpty()
  finalScore: number;

  @IsObject()
  ratingScaleUsed: any;

  @IsDateString()
  appraisalDate: Date;

  @IsEnum(['manager-assessment', 'self-assessment'])
  method: string;
}
