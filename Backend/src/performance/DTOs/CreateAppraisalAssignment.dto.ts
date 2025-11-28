import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AppraisalAssignmentStatus } from '../enums/performance.enums';

export class CreateAppraisalAssignmentDto {
  @IsString()
  @IsNotEmpty()
  cycleId: string;

  @IsString()
  appraisalTemplate: string;

  @IsString()
  employeeId: string;

  @IsString()
  managerId: string;

  @IsEnum(AppraisalAssignmentStatus)
  assignmentStatus: AppraisalAssignmentStatus;
}
