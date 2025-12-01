import { AppraisalDisputeStatus } from '../enums/performance.enums';
export declare class CreateAppraisalDisputeDTO {
    appraisalId: string;
    assignmentId: string;
    cycleId: string;
    raisedByEmployeeId: string;
    reason: string;
    details?: string;
    status?: AppraisalDisputeStatus;
    assignedReviewerEmployeeId?: string;
    resolutionSummary?: string;
    resolvedAt?: Date;
    resolvedByEmployeeId?: string;
    submittedAt?: Date;
}
