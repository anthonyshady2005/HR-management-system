import { ApprovalStatus } from '../enums/approval-status.enum';
export declare class ClearanceItemDto {
    department: string;
    status?: ApprovalStatus;
    comments?: string;
    updatedBy?: string;
    updatedAt?: string;
}
export declare class EquipmentItemDto {
    equipmentId?: string;
    name?: string;
    returned?: boolean;
    condition?: string;
}
export declare class UpdateClearanceChecklistDto {
    items?: ClearanceItemDto[];
    equipmentList?: EquipmentItemDto[];
    cardReturned?: boolean;
}
