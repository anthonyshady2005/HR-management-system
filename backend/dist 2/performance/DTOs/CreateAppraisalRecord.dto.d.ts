import { Types } from 'mongoose';
import { AppraisalRecordStatus } from '../enums/performance.enums';
declare class RatingEntryDTO {
    key: string;
    title: string;
    ratingLabel?: string;
    ratingValue?: number;
    weightedScore?: number;
    comments?: string;
}
export declare class CreateAppraisalRecordDTO {
    assignmentId: Types.ObjectId;
    cycleId: Types.ObjectId;
    templateId: Types.ObjectId;
    employeeProfileId: Types.ObjectId;
    managerProfileId: Types.ObjectId;
    ratings: RatingEntryDTO[];
    totalScore?: number;
    overallRatingLabel?: string;
    managerSummary?: string;
    strengths?: string;
    improvementAreas?: string;
    status?: AppraisalRecordStatus;
    managerSubmittedAt?: Date;
    hrPublishedAt?: Date;
    publishedByEmployeeId?: Types.ObjectId;
    employeeViewedAt?: Date;
    employeeAcknowledgedAt?: Date;
    employeeAcknowledgementComment?: string;
    archivedAt?: Date;
}
export {};
