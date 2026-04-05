import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { type StorageProviderInterface } from '@modules/shared/providers/storage/storage.interface';
import { STORAGE_PROVIDER } from '@modules/shared/providers/storage/storage.token';

import { type DocumentRepositoryInterface } from '../../document.repository.interface';
import { DOCUMENT_REPOSITORY_PROVIDE } from '../../document.token';
import { DocumentErrorFactory } from '../../factories/document.error.factory';

import {
  GetDocumentUrlUseCaseInterface,
  GetDocumentUrlUseCaseParams,
  GetDocumentUrlUseCaseResponse,
} from './get-document-url.interface';

const TTL_SECONDS = 15 * 60; // 15 minutes

@Injectable()
export class GetDocumentUrlUseCase implements GetDocumentUrlUseCaseInterface {
  constructor(
    @Inject(DOCUMENT_REPOSITORY_PROVIDE)
    private readonly documentRepository: DocumentRepositoryInterface,
    @Inject(STORAGE_PROVIDER)
    private readonly storage: StorageProviderInterface,
    private readonly configService: ConfigService,
  ) {}

  async execute(params: GetDocumentUrlUseCaseParams): Promise<GetDocumentUrlUseCaseResponse> {
    const document = await this.documentRepository.findById(params.id);
    if (!document) throw DocumentErrorFactory.notFound(params.id);

    const bucket = this.configService.get('STORAGE_MINIO_BUCKET', 'documents');
    const url = await this.storage.getSignedUrl(bucket, document.documentUrl, TTL_SECONDS);

    return { url, expiresIn: TTL_SECONDS };
  }
}
