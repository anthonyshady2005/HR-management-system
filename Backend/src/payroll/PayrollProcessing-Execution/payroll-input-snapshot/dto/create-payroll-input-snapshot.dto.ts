import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreatePayrollInputSnapshotDto {
  @IsMongoId()
  run_id: string;

  @IsMongoId()
  payslip: string;

  @IsString()
  employeeCode: string;
}
