import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateAllowanceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  amount: number;
}
