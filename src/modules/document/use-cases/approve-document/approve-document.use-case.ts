import { Inject, Injectable } from '@nestjs/common';

import { type DocumentRepositoryInterface } from '../../document.repository.interface';
import { DOCUMENT_REPOSITORY_PROVIDE } from '../../document.token';
import { DocumentErrorFactory } from '../../factories/document.error.factory';

import {
  ApproveDocumentUseCaseInterface,
  ApproveDocumentUseCaseParams,
  ApproveDocumentUseCaseResponse,
} from './approve-document.interface';

@Injectable()
export class ApproveDocumentUseCase implements ApproveDocumentUseCaseInterface {
  constructor(
    @Inject(DOCUMENT_REPOSITORY_PROVIDE)
    private readonly documentRepository: DocumentRepositoryInterface,
  ) {}

  async execute(params: ApproveDocumentUseCaseParams): Promise<ApproveDocumentUseCaseResponse> {
    const document = await this.documentRepository.findById(params.id);
    if (!document) throw DocumentErrorFactory.notFound(params.id);

    if (document.status !== 'PENDING') {
      throw DocumentErrorFactory.invalidStatusTransition(document.status, 'APPROVED');
    }

    return this.documentRepository.updateStatus(params.id, 'APPROVED', new Date());
  }
}
