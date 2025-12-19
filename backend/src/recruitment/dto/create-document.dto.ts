/**
 * # Document – Create DTO
 *
 * DTO used to upload / register new documents in the system.
 * Supports linking documents to various entities (applications, candidates, etc.)
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

  // Support for linking documents to applications, candidates, etc.
  @IsOptional()
  @IsString()
  entityType?: string; // 'application', 'candidate', 'offer', etc.

  @IsOptional()
  @IsMongoId()
  entityId?: string; // ID of the linked entity
}
