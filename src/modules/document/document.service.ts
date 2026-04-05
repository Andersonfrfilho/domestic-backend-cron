import { Inject, Injectable } from '@nestjs/common';
import { Readable } from 'stream';

import { Document } from '@modules/shared/providers/database/entities/document.entity';

import { type UploadDocumentUseCaseInterface, UploadDocumentUseCaseParams } from './use-cases/upload-document/upload-document.interface';
import { type GetDocumentUrlUseCaseInterface, GetDocumentUrlUseCaseResponse } from './use-cases/get-document-url/get-document-url.interface';
import { type ApproveDocumentUseCaseInterface } from './use-cases/approve-document/approve-document.interface';
import { type RejectDocumentUseCaseInterface } from './use-cases/reject-document/reject-document.interface';
import {
  DOCUMENT_APPROVE_USE_CASE_PROVIDE,
  DOCUMENT_GET_URL_USE_CASE_PROVIDE,
  DOCUMENT_REJECT_USE_CASE_PROVIDE,
  DOCUMENT_UPLOAD_USE_CASE_PROVIDE,
} from './document.token';

export interface DocumentServiceInterface {
  upload(params: UploadDocumentUseCaseParams): Promise<Document>;
  getUrl(id: string): Promise<GetDocumentUrlUseCaseResponse>;
  approve(id: string): Promise<Document>;
  reject(id: string): Promise<Document>;
}

@Injectable()
export class DocumentService implements DocumentServiceInterface {
  constructor(
    @Inject(DOCUMENT_UPLOAD_USE_CASE_PROVIDE)
    private readonly uploadUseCase: UploadDocumentUseCaseInterface,
    @Inject(DOCUMENT_GET_URL_USE_CASE_PROVIDE)
    private readonly getUrlUseCase: GetDocumentUrlUseCaseInterface,
    @Inject(DOCUMENT_APPROVE_USE_CASE_PROVIDE)
    private readonly approveUseCase: ApproveDocumentUseCaseInterface,
    @Inject(DOCUMENT_REJECT_USE_CASE_PROVIDE)
    private readonly rejectUseCase: RejectDocumentUseCaseInterface,
  ) {}

  upload(params: UploadDocumentUseCaseParams): Promise<Document> {
    return this.uploadUseCase.execute(params);
  }

  getUrl(id: string): Promise<GetDocumentUrlUseCaseResponse> {
    return this.getUrlUseCase.execute({ id });
  }

  approve(id: string): Promise<Document> {
    return this.approveUseCase.execute({ id });
  }

  reject(id: string): Promise<Document> {
    return this.rejectUseCase.execute({ id });
  }
}
