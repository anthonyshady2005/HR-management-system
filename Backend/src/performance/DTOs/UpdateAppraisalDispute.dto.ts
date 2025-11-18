import { PartialType } from '@nestjs/mapped-types';
import { CreateAppraisalDisputeDto } from './CreateAppraisalDispute.dto';

export class UpdateAppraisalDisputeDto extends PartialType(CreateAppraisalDisputeDto) {}
