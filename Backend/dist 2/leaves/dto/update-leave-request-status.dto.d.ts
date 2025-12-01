import { LeaveStatus } from '../enums/leave-status.enum';
export declare class UpdateLeaveRequestStatusDto {
    status: LeaveStatus;
    decidedBy?: string;
    role?: string;
}
