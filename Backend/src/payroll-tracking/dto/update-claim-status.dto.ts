import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ClaimStatus } from '../enums/payroll-tracking-enum';

export class UpdateClaimStatusDto {
    @IsNotEmpty()
    @IsEnum(ClaimStatus)
    status: ClaimStatus;

    @IsOptional()
    @IsNumber()
    approvedAmount?: number;

    @IsOptional()
    @IsString()
    rejectionReason?: string;

    @IsOptional()
    @IsString()
    resolutionComment?: string;
}
