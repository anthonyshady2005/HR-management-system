import { Types } from "mongoose";
import { ShiftAssignmentStatus } from "../models/enums";
export declare class ShiftAssignmentListItemDTO {
    _id: Types.ObjectId;
    employeeId?: Types.ObjectId;
    departmentId?: Types.ObjectId;
    positionId?: Types.ObjectId;
    shiftId: {
        _id: Types.ObjectId;
        name?: string;
    };
    scheduleRuleId?: {
        _id: Types.ObjectId;
        name?: string;
    };
    startDate: Date;
    endDate?: Date;
    status: ShiftAssignmentStatus;
}
