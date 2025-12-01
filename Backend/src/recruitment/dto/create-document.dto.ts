/**
 * # Document – Create DTO
 *
 * DTO used to upload / register new documents in the system.
 */

import {
  IsMongoId,
  IsOptional,
  IsEnum,
  IsString,
} from 'class-validator';
import { DocumentType } from '../enums/document-type.enum';

export class CreateDocumentDto {
  @IsOptional()
  @IsMongoId()
  ownerId?: string;

  @IsEnum(DocumentType)
  type!: DocumentType;

  @IsString()
  filePath!: string;
}
