import { IsDateString, IsMongoId, IsOptional, IsString, IsEnum } from 'class-validator';
import { PayRollStatus } from '../enums/payroll-execution-enum';

export class InitiatePayrollDto {
    @IsDateString()
    period: string;

    @IsString()
    entity: string;

    @IsMongoId()
    payrollSpecialistId: string;

    @IsMongoId()
    payrollManagerId: string;


    @IsMongoId()
    primaryDepartmentId: string;


}

export class ApprovePayrollDto {
    @IsEnum(PayRollStatus)
    status: PayRollStatus;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsMongoId()
    approverId: string;
}

export class PayrollApprovalDto {
    // approverId is now passed via URL parameter
}

export class PayrollRejectionDto {
    @IsString()
    reason: string;
}
