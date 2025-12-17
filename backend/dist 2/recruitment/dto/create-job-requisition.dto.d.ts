export declare const PUBLISH_STATUSES: readonly ["draft", "published", "closed"];
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];
export declare class CreateJobRequisitionDto {
    requisitionId: string;
    templateId?: string;
    openings: number;
    location?: string;
    hiringManagerId: string;
    publishStatus?: PublishStatus;
    postingDate?: string;
    expiryDate?: string;
}
