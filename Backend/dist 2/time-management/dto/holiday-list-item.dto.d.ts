import { Types } from "mongoose";
import { HolidayType } from "../models/enums";
export declare class HolidayListItemDTO {
    _id: Types.ObjectId;
    type: HolidayType;
    startDate: Date;
    endDate?: Date;
    name?: string;
    active: boolean;
}
