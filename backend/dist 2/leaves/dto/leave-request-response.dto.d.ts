import { LeaveTypeResponseDto } from './leave-type-response.dto';
declare class ApprovalFlowItemDto {
    role: string;
    status: string;
    decidedBy?: string;
    decidedAt?: Date;
}
export declare class LeaveRequestResponseDto {
    id: string;
    employeeId: string;
    leaveType: LeaveTypeResponseDto;
    dates: {
        from: Date;
        to: Date;
    };
    durationDays: number;
    justification?: string;
    attachmentId?: string;
    approvalFlow: ApprovalFlowItemDto[];
    status: string;
    irregularPatternFlag: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export {};
