import { LeaveTypeResponseDto } from './leave-type-response.dto';
export declare class LeaveEntitlementResponseDto {
    id: string;
    employeeId: string;
    leaveType: LeaveTypeResponseDto;
    yearlyEntitlement: number;
    accruedActual: number;
    accruedRounded: number;
    carryForward: number;
    taken: number;
    pending: number;
    remaining: number;
    lastAccrualDate?: Date;
    nextResetDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
