import { Document } from '@modules/shared/providers/database/entities/document.entity';

export interface ApproveDocumentUseCaseParams {
  id: string;
}

export type ApproveDocumentUseCaseResponse = Document;

export interface ApproveDocumentUseCaseInterface {
  execute(params: ApproveDocumentUseCaseParams): Promise<ApproveDocumentUseCaseResponse>;
}
