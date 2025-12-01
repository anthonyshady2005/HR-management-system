import { Types } from "mongoose";
import { TimeExceptionType, TimeExceptionStatus } from "../models/enums";

export class TimeExceptionListItemDTO {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  type: TimeExceptionType;
  attendanceRecordId: { _id: Types.ObjectId; date?: Date };
  assignedTo: Types.ObjectId;
  status: TimeExceptionStatus;
  reason?: string;
}
