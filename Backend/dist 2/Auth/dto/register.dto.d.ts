import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';
export declare class RegisterDto {
    firstName: string;
    lastName: string;
    personalEmail: string;
    nationalId: string;
    password: string;
    roles?: SystemRole[];
}
