import { LeaveStatus } from '../enums/leave-status.enum';
export declare class LeaveRequestQueryDto {
    employeeId?: string;
    leaveTypeId?: string;
    status?: LeaveStatus;
    startDate?: string;
    endDate?: string;
    departmentId?: string;
    sortBy?: 'dates.from' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}
