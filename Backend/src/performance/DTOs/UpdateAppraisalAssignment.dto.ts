import { PartialType } from '@nestjs/mapped-types';
import { CreateAppraisalAssignmentDto } from './CreateAppraisalAssignment.dto';

export class UpdateAppraisalAssignmentDto extends PartialType(CreateAppraisalAssignmentDto) {}
