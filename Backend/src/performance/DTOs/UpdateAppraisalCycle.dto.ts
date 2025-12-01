import { PartialType } from '@nestjs/mapped-types';
import { CreateAppraisalCycleDTO } from './CreateAppraisalCycle.dto';

export class UpdateAppraisalCycleDto extends PartialType(CreateAppraisalCycleDTO) {}
