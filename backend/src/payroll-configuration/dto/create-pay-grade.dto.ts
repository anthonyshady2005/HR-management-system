import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreatePayGradeDto {
  @IsString()
  @IsNotEmpty()
  grade: string;

  @IsNumber()
  @Min(6000)
  baseSalary: number;


}
