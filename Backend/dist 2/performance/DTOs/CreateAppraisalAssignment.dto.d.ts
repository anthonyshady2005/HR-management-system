import { Types } from 'mongoose';
import { AppraisalAssignmentStatus } from '../enums/performance.enums';
export declare class CreateAppraisalAssignmentDTO {
    cycleId: Types.ObjectId;
    templateId: Types.ObjectId;
    employeeProfileId: Types.ObjectId;
    managerProfileId: Types.ObjectId;
    departmentId: Types.ObjectId;
    positionId?: Types.ObjectId;
    status?: AppraisalAssignmentStatus;
    assignedAt?: Date;
    dueDate?: Date;
    submittedAt?: Date;
    publishedAt?: Date;
    latestAppraisalId?: Types.ObjectId;
}
