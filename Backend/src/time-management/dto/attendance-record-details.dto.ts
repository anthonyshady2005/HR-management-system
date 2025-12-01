import { Types } from "mongoose";
import { PunchType } from "../models/enums";

export class AttendanceRecordDetailsDTO {
  _id: Types.ObjectId;

  employeeId: {
    _id: Types.ObjectId;
    fullName?: string;
    position?: string;
  };

  punches: { type: PunchType; time: Date }[];

  totalWorkMinutes: number;
  hasMissedPunch: boolean;

  exceptionIds: {
    _id: Types.ObjectId;
    type?: string;
    status?: string;
  }[];

  finalisedForPayroll: boolean;
}
