import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DisputeStatus } from '../enums/payroll-tracking-enum';

export class UpdateDisputeStatusDto {
    @IsNotEmpty()
    @IsEnum(DisputeStatus)
    status: DisputeStatus;

    @IsOptional()
    @IsString()
    rejectionReason?: string;

    @IsOptional()
    @IsString()
    resolutionComment?: string;
}
