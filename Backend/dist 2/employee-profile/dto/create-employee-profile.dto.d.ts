export declare class CreateEmployeeProfileDto {
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    employmentStatus?: 'Active' | 'OnProbation' | 'Suspended' | 'Terminated' | 'Resigned';
    positionId?: string;
    systemRoles?: string[];
    isActive?: boolean;
    profilePictureUrl?: string;
}
