import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateTaxRuleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  rate: number;
}
