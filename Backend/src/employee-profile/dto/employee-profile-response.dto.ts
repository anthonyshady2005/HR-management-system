/* eslint-disable prettier/prettier */
import { EmployeeStatus } from '../enums/employee-profile.enums';

export class EmployeeProfileResponseDto {
  id!: string;
  employeeNumber!: string;
  name!: string;
  status!: EmployeeStatus;
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

  position?: any | null; // populated Position projection {code,title,_id}
  department?: any | null; // populated Department projection {code,name,_id}

  lastAppraisal?: {
    totalScore?: number;
    overallRatingLabel?: string;
    cycleId?: string;
    templateId?: string;
    createdAt?: Date;
  } | null;
}
