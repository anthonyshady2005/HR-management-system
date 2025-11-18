import { PartialType } from '@nestjs/mapped-types';
import { CreateAppraisalCycleDto } from './CreateAppraisalCycle.dto';

export class UpdateAppraisalCycleDto extends PartialType(CreateAppraisalCycleDto) {}
