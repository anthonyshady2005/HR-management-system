import { IsString, IsOptional, IsInt, Min, IsBoolean } from "class-validator";

export class LatenessRuleCreateDTO {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  gracePeriodMinutes: number;

  @IsInt()
  @Min(0)
  deductionForEachMinute: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
