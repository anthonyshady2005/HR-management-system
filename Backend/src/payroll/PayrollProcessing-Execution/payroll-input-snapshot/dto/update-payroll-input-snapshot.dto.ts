import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class UpdatePayrollInputSnapshotDto {
	@IsOptional()
	@IsMongoId()
	run_id?: string;

	@IsOptional()
	@IsMongoId()
	payslip?: string;

	@IsOptional()
	@IsString()
	employeeCode?: string;
}
