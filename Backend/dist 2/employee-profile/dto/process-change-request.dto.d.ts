import { ProfileChangeStatus } from '../enums/employee-profile.enums';
export declare class ProcessChangeRequestDto {
    status: ProfileChangeStatus.APPROVED | ProfileChangeStatus.REJECTED;
    comments?: string;
}
