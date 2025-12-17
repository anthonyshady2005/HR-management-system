import { Types } from "mongoose";
import { TimeExceptionType, TimeExceptionStatus } from "../models/enums";
export declare class TimeExceptionCreateDTO {
    employeeId: Types.ObjectId;
    type: TimeExceptionType;
    attendanceRecordId: Types.ObjectId;
    assignedTo: Types.ObjectId;
    status?: TimeExceptionStatus;
    reason?: string;
}
