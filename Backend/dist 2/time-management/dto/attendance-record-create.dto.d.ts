import { Types } from "mongoose";
import { PunchType } from "../models/enums";
declare class PunchInput {
    type: PunchType;
    time: Date;
}
export declare class AttendanceRecordCreateDTO {
    employeeId: Types.ObjectId;
    punches?: PunchInput[];
}
export {};
