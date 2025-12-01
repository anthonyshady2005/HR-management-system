import { Types } from "mongoose";
import { TimeExceptionType, TimeExceptionStatus } from "../models/enums";
export declare class TimeExceptionDetailsDTO {
    _id: Types.ObjectId;
    employeeId: {
        _id: Types.ObjectId;
        fullName?: string;
        position?: string;
    };
    type: TimeExceptionType;
    attendanceRecordId: {
        _id: Types.ObjectId;
        punches?: {
            type: string;
            time: Date;
        }[];
        totalWorkMinutes?: number;
    };
    assignedTo: {
        _id: Types.ObjectId;
        fullName?: string;
    };
    status: TimeExceptionStatus;
    reason?: string;
}
