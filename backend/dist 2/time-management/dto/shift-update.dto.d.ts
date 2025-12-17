import { Types } from "mongoose";
import { PunchPolicy } from "../models/enums";
export declare class ShiftUpdateDTO {
    name?: string;
    shiftType?: Types.ObjectId;
    startTime?: string;
    endTime?: string;
    punchPolicy?: PunchPolicy;
    graceInMinutes?: number;
    graceOutMinutes?: number;
    requiresApprovalForOvertime?: boolean;
    active?: boolean;
}
