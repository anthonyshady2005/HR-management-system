import { HolidayType } from "../models/enums";
export declare class HolidayUpdateDTO {
    type?: HolidayType;
    startDate?: Date;
    endDate?: Date;
    name?: string;
    active?: boolean;
}
