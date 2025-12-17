import { Types } from "mongoose";
export declare class LatenessRuleDetailsDTO {
    _id: Types.ObjectId;
    name: string;
    description?: string;
    gracePeriodMinutes: number;
    deductionForEachMinute: number;
    active: boolean;
}
