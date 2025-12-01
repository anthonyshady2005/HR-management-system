import { DocumentType } from '../enums/document-type.enum';
export declare class UpdateDocumentDto {
    ownerId?: string;
    type?: DocumentType;
    filePath?: string;
    uploadedAt?: string;
}
