import { IsString, IsBoolean, IsOptional } from "class-validator";

export class ShiftTypeCreateDTO {
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
