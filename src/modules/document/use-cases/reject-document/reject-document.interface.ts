import { Document } from '@modules/shared/providers/database/entities/document.entity';

export interface RejectDocumentUseCaseParams {
  id: string;
}

export type RejectDocumentUseCaseResponse = Document;

export interface RejectDocumentUseCaseInterface {
  execute(params: RejectDocumentUseCaseParams): Promise<RejectDocumentUseCaseResponse>;
}
