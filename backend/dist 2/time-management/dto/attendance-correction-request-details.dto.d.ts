import { Types } from "mongoose";
import { CorrectionRequestStatus } from "../models/enums";
export declare class AttendanceCorrectionRequestDetailsDTO {
    _id: Types.ObjectId;
    employeeId: {
        _id: Types.ObjectId;
        fullName?: string;
        position?: string;
    };
    attendanceRecord: {
        _id: Types.ObjectId;
        punches?: {
            type: string;
            time: Date;
        }[];
        totalWorkMinutes?: number;
        date?: Date;
    };
    reason?: string;
    status: CorrectionRequestStatus;
}
