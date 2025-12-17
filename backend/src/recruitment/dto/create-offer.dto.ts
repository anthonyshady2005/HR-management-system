// create-offer.dto.ts

/**
 * # Offer – Create DTO
 *
 * DTO used to create job offers for candidates.
 */

import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  IsDateString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApprovalStatus } from '../enums/approval-status.enum';

export class OfferApproverDto {
  @IsMongoId()
  employeeId!: string;

  @IsString()
  role!: string;

  @IsEnum(ApprovalStatus)
  status!: ApprovalStatus;

  @IsOptional()
  @IsDateString()
  actionDate?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class CreateOfferDto {
  @IsMongoId()
  applicationId!: string;

  @IsMongoId()
  candidateId!: string;

  @IsOptional()
  @IsMongoId()
  hrEmployeeId?: string;

  @IsNumber()
  grossSalary!: number;

  @IsOptional()
  @IsNumber()
  signingBonus?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @IsOptional()
  @IsString()
  conditions?: string;

  @IsOptional()
  @IsString()
  insurances?: string;

  @IsString()
  content!: string;

  @IsString()
  role!: string;

  @IsDateString()
  deadline!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfferApproverDto)
  approvers?: OfferApproverDto[];
}
