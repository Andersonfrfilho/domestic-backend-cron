import { Inject, Injectable } from '@nestjs/common';

import { type DocumentRepositoryInterface } from '../../document.repository.interface';
import { DOCUMENT_REPOSITORY_PROVIDE } from '../../document.token';
import { DocumentErrorFactory } from '../../factories/document.error.factory';

import {
  RejectDocumentUseCaseInterface,
  RejectDocumentUseCaseParams,
  RejectDocumentUseCaseResponse,
} from './reject-document.interface';

@Injectable()
export class RejectDocumentUseCase implements RejectDocumentUseCaseInterface {
  constructor(
    @Inject(DOCUMENT_REPOSITORY_PROVIDE)
    private readonly documentRepository: DocumentRepositoryInterface,
  ) {}

  async execute(params: RejectDocumentUseCaseParams): Promise<RejectDocumentUseCaseResponse> {
    const document = await this.documentRepository.findById(params.id);
    if (!document) throw DocumentErrorFactory.notFound(params.id);

    if (document.status !== 'PENDING') {
      throw DocumentErrorFactory.invalidStatusTransition(document.status, 'REJECTED');
    }

    return this.documentRepository.updateStatus(params.id, 'REJECTED', new Date());
  }
}
