import { AdjustmentType } from '../enums/adjustment-type.enum';
export declare class CreateAdjustmentDto {
    employeeId: string;
    leaveTypeId: string;
    adjustmentType: AdjustmentType;
    amount: number;
    reason: string;
    hrUserId: string;
}
