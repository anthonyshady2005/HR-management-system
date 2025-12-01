import { InterviewMethod } from '../enums/interview-method.enum';
import { InterviewStatus } from '../enums/interview-status.enum';
export declare class UpdateInterviewDto {
    scheduledDate?: string;
    method?: InterviewMethod;
    panel?: string[];
    calendarEventId?: string;
    videoLink?: string;
    status?: InterviewStatus;
    feedbackId?: string;
    candidateFeedback?: string;
}
