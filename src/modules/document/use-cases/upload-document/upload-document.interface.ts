import { Readable } from 'stream';

import { Document } from '@modules/shared/providers/database/entities/document.entity';

export interface UploadDocumentUseCaseParams {
  userId: string;
  documentType: string;
  filename: string;
  mimetype: string;
  stream: Readable;
  size: number;
}

export type UploadDocumentUseCaseResponse = Document;

export interface UploadDocumentUseCaseInterface {
  execute(params: UploadDocumentUseCaseParams): Promise<UploadDocumentUseCaseResponse>;
}
