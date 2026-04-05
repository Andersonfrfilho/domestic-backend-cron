import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

import { type StorageProviderInterface } from '@modules/shared/providers/storage/storage.interface';
import { STORAGE_PROVIDER } from '@modules/shared/providers/storage/storage.token';

import { type DocumentRepositoryInterface } from '../../document.repository.interface';
import { DOCUMENT_REPOSITORY_PROVIDE } from '../../document.token';

import {
  UploadDocumentUseCaseInterface,
  UploadDocumentUseCaseParams,
  UploadDocumentUseCaseResponse,
} from './upload-document.interface';

@Injectable()
export class UploadDocumentUseCase implements UploadDocumentUseCaseInterface {
  constructor(
    @Inject(DOCUMENT_REPOSITORY_PROVIDE)
    private readonly documentRepository: DocumentRepositoryInterface,
    @Inject(STORAGE_PROVIDER)
    private readonly storage: StorageProviderInterface,
    private readonly configService: ConfigService,
  ) {}

  async execute(params: UploadDocumentUseCaseParams): Promise<UploadDocumentUseCaseResponse> {
    const bucket = this.configService.get('STORAGE_MINIO_BUCKET', 'documents');
    const ext = params.filename.split('.').pop() ?? 'bin';
    const objectName = `${params.userId}/${params.documentType}/${randomUUID()}.${ext}`;

    await this.storage.upload({
      bucket,
      objectName,
      stream: params.stream,
      size: params.size,
      contentType: params.mimetype,
    });

    return this.documentRepository.create({
      userId: params.userId,
      documentType: params.documentType,
      documentUrl: objectName,
      status: 'PENDING',
    });
  }
}
