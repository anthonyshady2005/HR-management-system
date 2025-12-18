/**
 * # Document – Update DTO
 *
 * DTO used to update document metadata (type, filePath, timestamps).
 */

import {
  IsMongoId,
  IsOptional,
  IsEnum,
  IsString,
  IsDateString,
} from 'class-validator';
import { DocumentType } from '../enums/document-type.enum';

export class UpdateDocumentDto {
  @IsOptional()
  @IsMongoId()
  ownerId?: string;

  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @IsOptional()
  @IsString()
  filePath?: string;

  @IsOptional()
  @IsDateString()
  uploadedAt?: string;
}
