import { OnboardingTaskStatus } from '../enums/onboarding-task-status.enum';
export declare class OnboardingTaskDto {
    name: string;
    department: string;
    status?: OnboardingTaskStatus;
    deadline?: string;
    completedAt?: string;
    documentId?: string;
    notes?: string;
}
export declare class CreateOnboardingDto {
    employeeId: string;
    tasks?: OnboardingTaskDto[];
    completed?: boolean;
    completedAt?: string;
}
