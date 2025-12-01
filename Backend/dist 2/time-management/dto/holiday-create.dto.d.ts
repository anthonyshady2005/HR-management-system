import { HolidayType } from "../models/enums";
export declare class HolidayCreateDTO {
    type: HolidayType;
    startDate: Date;
    endDate?: Date;
    name?: string;
    active?: boolean;
}
