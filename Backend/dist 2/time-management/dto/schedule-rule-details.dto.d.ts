import { Types } from "mongoose";
export declare class ScheduleRuleDetailsDTO {
    _id: Types.ObjectId;
    name: string;
    pattern: string;
    active: boolean;
}
