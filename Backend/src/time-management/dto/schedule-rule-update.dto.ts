import { IsString, IsBoolean, IsOptional } from "class-validator";

export class ScheduleRuleUpdateDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  pattern?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
