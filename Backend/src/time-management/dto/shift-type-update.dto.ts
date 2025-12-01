import { IsString, IsBoolean, IsOptional } from "class-validator";

export class ShiftTypeUpdateDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
