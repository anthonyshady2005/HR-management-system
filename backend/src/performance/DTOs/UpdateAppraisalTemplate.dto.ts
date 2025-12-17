import { PartialType } from '@nestjs/mapped-types';
import { CreateAppraisalTemplateDto } from './CreateAppraisalTemplate.dto';

export class UpdateAppraisalTemplateDto extends PartialType(CreateAppraisalTemplateDto) {}
