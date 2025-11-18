import { IsDateString, IsEnum, IsNotEmpty, IsString, IsArray } from 'class-validator';

export class CreateAppraisalCycleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsArray()
  @IsString({ each: true })
  template_ids: string[];

  @IsString()
  createdBy: string;

  @IsEnum(['annual', 'semi-annual', 'Probationary'])
  cycleType: string;
}
