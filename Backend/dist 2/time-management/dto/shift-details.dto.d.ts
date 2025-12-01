import { Types } from "mongoose";
import { PunchPolicy } from "../models/enums";
export declare class ShiftDetailsDTO {
    _id: Types.ObjectId;
    name: string;
    shiftType: {
        _id: Types.ObjectId;
        name: string;
    };
    startTime: string;
    endTime: string;
    punchPolicy: PunchPolicy;
    graceInMinutes: number;
    graceOutMinutes: number;
    requiresApprovalForOvertime: boolean;
    active: boolean;
}
