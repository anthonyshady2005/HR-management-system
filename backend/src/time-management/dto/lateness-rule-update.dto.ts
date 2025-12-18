import { IsString, IsOptional, IsInt, Min, IsBoolean } from "class-validator";

export class LatenessRuleUpdateDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  gracePeriodMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  deductionForEachMinute?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
