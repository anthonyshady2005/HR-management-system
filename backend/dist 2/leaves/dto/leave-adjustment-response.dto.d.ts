import { LeaveTypeResponseDto } from './leave-type-response.dto';
export declare class LeaveAdjustmentResponseDto {
    id: string;
    employeeId: string;
    leaveType: LeaveTypeResponseDto;
    adjustmentType: string;
    amount: number;
    reason: string;
    hrUserId: string;
    createdAt: Date;
    updatedAt: Date;
}
