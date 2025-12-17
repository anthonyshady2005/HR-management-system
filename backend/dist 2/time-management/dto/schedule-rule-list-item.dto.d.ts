import { Types } from "mongoose";
export declare class ScheduleRuleListItemDTO {
    _id: Types.ObjectId;
    name: string;
    pattern: string;
    active: boolean;
}
