import { IsIn, IsMongoId, IsOptional, IsString } from 'class-validator';

export class UpdateApprovalChainDto {
	@IsOptional()
	@IsMongoId()
	run_id?: string;

	@IsOptional()
	@IsString()
	@IsIn(['payroll_review', 'payroll_manager', 'finance'])
	stage?: string;

	@IsOptional()
	@IsString()
	@IsIn(['approved', 'rejected'])
	status?: string;

	@IsOptional()
	@IsString()
	approver_id?: string;

	@IsOptional()
	@IsString()
	reason?: string;

	@IsOptional()
	@IsString()
	acted_at?: string;
}
