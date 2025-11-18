import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeAppraisalHistoryDto } from './CreateEmployeeAppraisalHistory.dto';

export class UpdateEmployeeAppraisalHistoryDto extends PartialType(CreateEmployeeAppraisalHistoryDto) {}
