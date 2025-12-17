import type { PublishStatus } from './create-job-requisition.dto';
export declare class UpdateJobRequisitionDto {
    requisitionId?: string;
    templateId?: string;
    openings?: number;
    location?: string;
    hiringManagerId?: string;
    publishStatus?: PublishStatus;
    postingDate?: string;
    expiryDate?: string;
}
