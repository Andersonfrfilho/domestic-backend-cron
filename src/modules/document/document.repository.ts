import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { Document } from '@modules/shared/providers/database/entities/document.entity';

import { CreateDocumentParams, DocumentRepositoryInterface } from './document.repository.interface';
import { DocumentErrorFactory } from './factories/document.error.factory';

@Injectable()
export class DocumentRepository implements DocumentRepositoryInterface {
  constructor(
    @InjectRepository(Document, CONNECTIONS_NAMES.POSTGRES)
    private readonly repo: Repository<Document>,
  ) {}

  async create(params: CreateDocumentParams): Promise<Document> {
    const document = this.repo.create(params);
    return this.repo.save(document);
  }

  async findById(id: string): Promise<Document | null> {
    return this.repo.findOne({ where: { id } });
  }

  async updateStatus(id: string, status: string, verifiedAt?: Date): Promise<Document> {
    await this.repo.update(id, { status, ...(verifiedAt ? { verifiedAt } : {}) });
    const updated = await this.findById(id);
    if (!updated) throw DocumentErrorFactory.notFound(id);
    return updated;
  }
}
