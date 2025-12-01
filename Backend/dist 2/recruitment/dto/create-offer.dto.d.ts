import { ApprovalStatus } from '../enums/approval-status.enum';
export declare class OfferApproverDto {
    employeeId: string;
    role: string;
    status: ApprovalStatus;
    actionDate?: string;
    comment?: string;
}
export declare class CreateOfferDto {
    applicationId: string;
    candidateId: string;
    hrEmployeeId?: string;
    grossSalary: number;
    signingBonus?: number;
    benefits?: string[];
    conditions?: string;
    insurances?: string;
    content: string;
    role: string;
    deadline: string;
    approvers?: OfferApproverDto[];
}
