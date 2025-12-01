import { Types } from "mongoose";
import { PunchType } from "../models/enums";
declare class PunchUpdateInput {
    type?: PunchType;
    time?: Date;
}
export declare class AttendanceRecordUpdateDTO {
    employeeId?: Types.ObjectId;
    punches?: PunchUpdateInput[];
}
export {};
