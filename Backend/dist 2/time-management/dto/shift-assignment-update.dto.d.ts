import { Types } from "mongoose";
import { ShiftAssignmentStatus } from "../models/enums";
export declare class ShiftAssignmentUpdateDTO {
    employeeId?: Types.ObjectId;
    departmentId?: Types.ObjectId;
    positionId?: Types.ObjectId;
    shiftId?: Types.ObjectId;
    scheduleRuleId?: Types.ObjectId;
    startDate?: Date;
    endDate?: Date;
    status?: ShiftAssignmentStatus;
}
