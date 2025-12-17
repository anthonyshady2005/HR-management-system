import { ApplicationStage } from '../enums/application-stage.enum';
import { InterviewMethod } from '../enums/interview-method.enum';
export declare class CreateInterviewDto {
    applicationId: string;
    stage: ApplicationStage;
    scheduledDate?: string;
    method?: InterviewMethod;
    panel?: string[];
    calendarEventId?: string;
    videoLink?: string;
}
