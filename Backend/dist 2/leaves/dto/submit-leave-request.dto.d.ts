declare class LeaveDateRangeDto {
    from: Date;
    to: Date;
}
export declare class SubmitLeaveRequestDto {
    employeeId: string;
    leaveTypeId: string;
    dates: LeaveDateRangeDto;
    durationDays: number;
    justification?: string;
    attachmentId?: string;
}
export {};
