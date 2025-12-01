import { EmployeeStatus } from '../enums/employee-profile.enums';
export declare class EmployeeProfileResponseDto {
    id: string;
    employeeNumber: string;
    name: string;
    status: EmployeeStatus;
    profilePictureUrl?: string;
    contact?: {
        email?: string;
        mobilePhone?: string;
        address?: {
            city?: string;
            streetAddress?: string;
            country?: string;
        };
    };
    position?: any | null;
    department?: any | null;
    lastAppraisal?: {
        totalScore?: number;
        overallRatingLabel?: string;
        cycleId?: string;
        templateId?: string;
        createdAt?: Date;
    } | null;
}
