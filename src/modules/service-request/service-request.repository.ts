import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { ServiceRequest } from '@modules/shared/providers/database/entities/service-request.entity';

import {
  CreateServiceRequestParams,
  ServiceRequestRepositoryInterface,
} from './service-request.repository.interface';
import { ServiceRequestErrorFactory } from './factories/service-request.error.factory';

@Injectable()
export class ServiceRequestRepository implements ServiceRequestRepositoryInterface {
  constructor(
    @InjectRepository(ServiceRequest, CONNECTIONS_NAMES.POSTGRES)
    private readonly repo: Repository<ServiceRequest>,
  ) {}

  async create(params: CreateServiceRequestParams): Promise<ServiceRequest> {
    const serviceRequest = this.repo.create({ ...params, status: 'PENDING' });
    return this.repo.save(serviceRequest);
  }

  async findById(id: string): Promise<ServiceRequest | null> {
    return this.repo.findOne({ where: { id } });
  }

  async listByContractor(contractorId: string): Promise<ServiceRequest[]> {
    return this.repo.find({ where: { contractorId }, order: { createdAt: 'DESC' } });
  }

  async listByProvider(providerId: string): Promise<ServiceRequest[]> {
    return this.repo.find({ where: { providerId }, order: { createdAt: 'DESC' } });
  }

  async updateStatus(id: string, status: string): Promise<ServiceRequest> {
    await this.repo.update(id, { status });
    const updated = await this.findById(id);
    if (!updated) throw ServiceRequestErrorFactory.notFound(id);
    return updated;
  }
}
