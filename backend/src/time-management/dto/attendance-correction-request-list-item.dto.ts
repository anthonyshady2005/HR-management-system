import { Types } from "mongoose";
import { CorrectionRequestStatus } from "../models/enums";

export class AttendanceCorrectionRequestListItemDTO {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  attendanceRecord: { _id: Types.ObjectId; date?: Date };
  reason?: string;
  status: CorrectionRequestStatus;
}
