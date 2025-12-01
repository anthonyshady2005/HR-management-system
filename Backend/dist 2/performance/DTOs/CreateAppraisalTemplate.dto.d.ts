import { AppraisalTemplateType, AppraisalRatingScaleType } from '../enums/performance.enums';
import { Types } from 'mongoose';
declare class RatingScaleDto {
    type: AppraisalRatingScaleType;
    min: number;
    max: number;
    step?: number;
    labels?: string[];
}
declare class EvaluationCriterionDto {
    key: string;
    title: string;
    details?: string;
    weight?: number;
    maxScore?: number;
    required?: boolean;
}
export declare class CreateAppraisalTemplateDto {
    name: string;
    description?: string;
    templateType: AppraisalTemplateType;
    ratingScale: RatingScaleDto;
    criteria?: EvaluationCriterionDto[];
    instructions?: string;
    applicableDepartmentIds?: Types.ObjectId[];
    applicablePositionIds?: Types.ObjectId[];
    isActive?: boolean;
}
export {};
