import { LeaveCategoryResponseDto } from './leave-category-response.dto';
export declare class LeaveTypeResponseDto {
    id: string;
    code: string;
    name: string;
    category: LeaveCategoryResponseDto;
    description?: string;
    paid: boolean;
    deductible: boolean;
    requiresAttachment: boolean;
    attachmentType?: string;
    minTenureMonths?: number;
    maxDurationDays?: number;
    createdAt: Date;
    updatedAt: Date;
}
