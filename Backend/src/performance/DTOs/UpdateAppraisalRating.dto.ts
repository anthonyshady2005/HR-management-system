import { PartialType } from '@nestjs/mapped-types';
import { CreateAppraisalRatingDto } from './CreateAppraisalRating.dto';

export class UpdateAppraisalRatingDto extends PartialType(CreateAppraisalRatingDto) {}
