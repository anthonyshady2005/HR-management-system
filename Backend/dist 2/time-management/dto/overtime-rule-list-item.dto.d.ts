import { Types } from "mongoose";
export declare class OvertimeRuleListItemDTO {
    _id: Types.ObjectId;
    name: string;
    description?: string;
    active: boolean;
    approved: boolean;
}
