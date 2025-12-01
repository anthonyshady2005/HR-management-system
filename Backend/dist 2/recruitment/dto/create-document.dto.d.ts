import { DocumentType } from '../enums/document-type.enum';
export declare class CreateDocumentDto {
    ownerId?: string;
    type: DocumentType;
    filePath: string;
}
