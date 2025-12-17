import { DisputeStatus } from '../enums/payroll-tracking-enum';
export declare class UpdateDisputeStatusDto {
    status: DisputeStatus;
    rejectionReason?: string;
    resolutionComment?: string;
}
