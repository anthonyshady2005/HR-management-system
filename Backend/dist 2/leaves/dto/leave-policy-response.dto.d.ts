import { LeaveTypeResponseDto } from './leave-type-response.dto';
export declare class LeavePolicyResponseDto {
    id: string;
    leaveType: LeaveTypeResponseDto;
    accrualMethod: string;
    monthlyRate: number;
    yearlyRate: number;
    carryForwardAllowed: boolean;
    maxCarryForward: number;
    expiryAfterMonths?: number;
    roundingRule: string;
    minNoticeDays: number;
    maxConsecutiveDays?: number;
    eligibility?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
