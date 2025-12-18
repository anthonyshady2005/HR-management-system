import { IsString, IsOptional, IsBoolean } from "class-validator";

export class OvertimeRuleUpdateDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  approved?: boolean;
}
