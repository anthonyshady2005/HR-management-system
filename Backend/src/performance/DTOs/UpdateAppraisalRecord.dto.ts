import { PartialType } from '@nestjs/mapped-types';
import { CreateAppraisalRecordDTO } from './CreateAppraisalRecord.dto';

export class UpdateAppraisalRecordDto extends PartialType(CreateAppraisalRecordDTO) {}