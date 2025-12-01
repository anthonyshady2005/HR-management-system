import { Types } from "mongoose";
import { ShiftAssignmentStatus } from "../models/enums";

export class ShiftAssignmentDetailsDTO {
  _id: Types.ObjectId;

  employeeId?: {
    _id: Types.ObjectId;
    fullName?: string;
    position?: string;
  };

  departmentId?: {
    _id: Types.ObjectId;
    name?: string;
  };

  positionId?: {
    _id: Types.ObjectId;
    name?: string;
  };

  shiftId: {
    _id: Types.ObjectId;
    name: string;
    startTime?: string;
    endTime?: string;
  };

  scheduleRuleId?: {
    _id: Types.ObjectId;
    name?: string;
  };

  startDate: Date;
  endDate?: Date;

  status: ShiftAssignmentStatus;
}
