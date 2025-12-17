import { IsArray, IsMongoId, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class PenaltyDto {
  @IsString()
  reason: string;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class CreateEmployeePenaltiesDto {
  @IsMongoId()
  employeeId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PenaltyDto)
  penalties?: PenaltyDto[];
}

export class UpdateEmployeePenaltiesDto {
  @IsOptional()
  @IsMongoId()
  employeeId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PenaltyDto)
  penalties?: PenaltyDto[];
}
