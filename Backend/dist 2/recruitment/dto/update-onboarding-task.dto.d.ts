import { OnboardingTaskStatus } from '../enums/onboarding-task-status.enum';
export declare class UpdateOnboardingTaskDto {
    onboardingId: string;
    taskIndex: number;
    status?: OnboardingTaskStatus;
    completedAt?: string;
    documentId?: string;
    notes?: string;
}
