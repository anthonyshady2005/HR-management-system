import { SystemRole } from '../enums/employee-profile.enums';
export declare class AssignRolesDto {
    roles: SystemRole[];
    permissions?: string[];
    isActive?: boolean;
    reason?: string;
}
