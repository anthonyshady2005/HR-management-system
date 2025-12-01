import { AccrualMethod } from '../enums/accrual-method.enum';
import { RoundingRule } from '../enums/rounding-rule.enum';
export declare class CreateLeavePolicyDto {
    leaveTypeId: string;
    accrualMethod?: AccrualMethod;
    monthlyRate?: number;
    yearlyRate?: number;
    carryForwardAllowed?: boolean;
    maxCarryForward?: number;
    expiryAfterMonths?: number;
    roundingRule?: RoundingRule;
    minNoticeDays?: number;
    maxConsecutiveDays?: number;
    eligibility?: Record<string, any>;
}
