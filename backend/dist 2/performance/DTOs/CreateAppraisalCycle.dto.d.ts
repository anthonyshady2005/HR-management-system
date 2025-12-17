import { AppraisalTemplateType, AppraisalCycleStatus } from '../enums/performance.enums';
declare class CycleTemplateAssignmentDTO {
    templateId: string;
    departmentIds: string[];
}
export declare class CreateAppraisalCycleDTO {
    name: string;
    description?: string;
    cycleType: AppraisalTemplateType;
    startDate: Date;
    endDate: Date;
    managerDueDate?: Date;
    employeeAcknowledgementDueDate?: Date;
    templateAssignments?: CycleTemplateAssignmentDTO[];
    status?: AppraisalCycleStatus;
    archivedAt?: Date;
    publishedAt?: Date;
    closedAt?: Date;
}
export {};
