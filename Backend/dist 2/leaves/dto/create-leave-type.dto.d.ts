import { AttachmentType } from '../enums/attachment-type.enum';
export declare class CreateLeaveTypeDto {
    code: string;
    name: string;
    categoryId: string;
    description?: string;
    paid?: boolean;
    deductible?: boolean;
    requiresAttachment?: boolean;
    attachmentType?: AttachmentType;
    minTenureMonths?: number;
    maxDurationDays?: number;
}
