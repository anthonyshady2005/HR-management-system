import { Types } from "mongoose";
import { CorrectionRequestStatus } from "../models/enums";
export declare class AttendanceCorrectionRequestUpdateDTO {
    employeeId?: Types.ObjectId;
    attendanceRecord?: Types.ObjectId;
    reason?: string;
    status?: CorrectionRequestStatus;
}
