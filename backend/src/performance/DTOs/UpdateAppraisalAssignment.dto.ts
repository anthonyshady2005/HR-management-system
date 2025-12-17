import { PartialType } from '@nestjs/mapped-types';
import { CreateAppraisalAssignmentDTO } from './CreateAppraisalAssignment.dto';

export class UpdateAppraisalAssignmentDto extends PartialType(CreateAppraisalAssignmentDTO) {}
