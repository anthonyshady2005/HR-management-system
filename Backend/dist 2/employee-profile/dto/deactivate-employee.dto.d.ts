import { EmployeeStatus } from '../enums/employee-profile.enums';
export declare class DeactivateEmployeeDto {
    status: EmployeeStatus;
    effectiveDate?: Date;
    reason: string;
}
