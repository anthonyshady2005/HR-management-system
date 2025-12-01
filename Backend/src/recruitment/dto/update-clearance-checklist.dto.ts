/**
 * # ClearanceChecklist – Update DTO
 *
 * DTO used to update clearance checklist items for a termination:
 * - department approval items
 * - equipment list
 * - cardReturned flag
 */

import {
  IsOptional,
  IsArray,
  IsString,
  IsEnum,
  IsMongoId,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApprovalStatus } from '../enums/approval-status.enum';

export class ClearanceItemDto {
  @IsString()
  department!: string;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsMongoId()
  updatedBy?: string;

  @IsOptional()
  @IsString()
  updatedAt?: string; // optional: if you later expose it in the API
}

export class EquipmentItemDto {
  @IsOptional()
  @IsMongoId()
  equipmentId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  returned?: boolean;

  @IsOptional()
  @IsString()
  condition?: string;
}

export class UpdateClearanceChecklistDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClearanceItemDto)
  items?: ClearanceItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EquipmentItemDto)
  equipmentList?: EquipmentItemDto[];

  @IsOptional()
  @IsBoolean()
  cardReturned?: boolean;
}
