import { PartialType } from '@nestjs/mapped-types';
import { CreateAppraisalDisputeDTO } from './CreateAppraisalDispute.dto';

export class UpdateAppraisalDisputeDto extends PartialType(CreateAppraisalDisputeDTO) {}
