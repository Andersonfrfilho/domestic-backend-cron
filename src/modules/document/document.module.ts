import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Document } from '@modules/shared/providers/database/entities/document.entity';
import { SharedModule } from '@modules/shared/shared.module';
import { UserModule } from '@modules/user/user.module';

import { CONNECTIONS_NAMES } from '../shared/providers/database/database.constant';

import { DocumentController } from './document.controller';
import { DocumentRepository } from './document.repository';
import { DocumentService } from './document.service';
import {
  DOCUMENT_APPROVE_USE_CASE_PROVIDE,
  DOCUMENT_GET_URL_USE_CASE_PROVIDE,
  DOCUMENT_REJECT_USE_CASE_PROVIDE,
  DOCUMENT_REPOSITORY_PROVIDE,
  DOCUMENT_SERVICE_PROVIDE,
  DOCUMENT_UPLOAD_USE_CASE_PROVIDE,
} from './document.token';
import { UploadDocumentUseCase } from './use-cases/upload-document/upload-document.use-case';
import { GetDocumentUrlUseCase } from './use-cases/get-document-url/get-document-url.use-case';
import { ApproveDocumentUseCase } from './use-cases/approve-document/approve-document.use-case';
import { RejectDocumentUseCase } from './use-cases/reject-document/reject-document.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document], CONNECTIONS_NAMES.POSTGRES),
    SharedModule,
    UserModule,
  ],
  controllers: [DocumentController],
  providers: [
    { provide: DOCUMENT_REPOSITORY_PROVIDE, useClass: DocumentRepository },
    { provide: DOCUMENT_UPLOAD_USE_CASE_PROVIDE, useClass: UploadDocumentUseCase },
    { provide: DOCUMENT_GET_URL_USE_CASE_PROVIDE, useClass: GetDocumentUrlUseCase },
    { provide: DOCUMENT_APPROVE_USE_CASE_PROVIDE, useClass: ApproveDocumentUseCase },
    { provide: DOCUMENT_REJECT_USE_CASE_PROVIDE, useClass: RejectDocumentUseCase },
    { provide: DOCUMENT_SERVICE_PROVIDE, useClass: DocumentService },
  ],
})
export class DocumentModule {}
