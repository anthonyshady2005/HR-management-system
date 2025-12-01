import { IsMongoId, IsString } from "class-validator";

export class LockPayrollDto {
  @IsMongoId()
  managerId: string;
}

export class UnlockPayrollDto {
  @IsMongoId()
  managerId: string;

  @IsString()
  reason: string;
}
