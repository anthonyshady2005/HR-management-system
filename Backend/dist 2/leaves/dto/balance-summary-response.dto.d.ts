import { LeaveTypeResponseDto } from './leave-type-response.dto';
export declare class BalanceSummaryResponseDto {
    leaveType: LeaveTypeResponseDto;
    yearlyEntitlement: number;
    carryForward: number;
    totalAvailable: number;
    taken: number;
    pending: number;
    accruedActual: number;
    accruedRounded: number;
    remaining: number;
    lastAccrualDate?: Date;
    nextResetDate?: Date;
}
