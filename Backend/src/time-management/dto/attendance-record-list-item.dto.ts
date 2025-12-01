import { Types } from "mongoose";
import { PunchType } from "../models/enums";

export class AttendanceRecordListItemDTO {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  punches: { type: PunchType; time: Date }[];
  totalWorkMinutes: number;
  hasMissedPunch: boolean;
  exceptionIds: Types.ObjectId[];
  finalisedForPayroll: boolean;
}
