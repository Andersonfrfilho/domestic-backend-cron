import { Document } from '@modules/shared/providers/database/entities/document.entity';

export interface CreateDocumentParams {
  userId: string;
  documentType: string;
  documentUrl: string;
  status: string;
}

export interface DocumentRepositoryInterface {
  create(params: CreateDocumentParams): Promise<Document>;
  findById(id: string): Promise<Document | null>;
  updateStatus(id: string, status: string, verifiedAt?: Date): Promise<Document>;
}
