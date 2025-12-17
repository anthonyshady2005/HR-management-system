import { ClaimStatus } from '../enums/payroll-tracking-enum';
export declare class UpdateClaimStatusDto {
    status: ClaimStatus;
    approvedAmount?: number;
    rejectionReason?: string;
    resolutionComment?: string;
}
