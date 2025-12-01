import { EmployeeStatus, ContractType, WorkType, Gender, MaritalStatus } from '../enums/employee-profile.enums';
declare class AddressDto {
    city?: string;
    streetAddress?: string;
    country?: string;
}
export declare class HrUpdateEmployeeProfileDto {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    nationalId?: string;
    gender?: Gender;
    maritalStatus?: MaritalStatus;
    dateOfBirth?: Date;
    personalEmail?: string;
    workEmail?: string;
    mobilePhone?: string;
    homePhone?: string;
    address?: AddressDto;
    profilePictureUrl?: string;
    biography?: string;
    employeeNumber?: string;
    dateOfHire?: Date;
    contractStartDate?: Date;
    contractEndDate?: Date;
    contractType?: ContractType;
    workType?: WorkType;
    status?: EmployeeStatus;
    statusEffectiveFrom?: Date;
    primaryPositionId?: string;
    primaryDepartmentId?: string;
    supervisorPositionId?: string;
    payGradeId?: string;
    changeReason?: string;
}
export {};
