import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { Service } from '@modules/shared/providers/database/entities/service.entity';

import {
  CreateServiceParams,
  ServiceRepositoryInterface,
  UpdateServiceParams,
} from './service.repository.interface';

@Injectable()
export class ServiceRepository implements ServiceRepositoryInterface {
  constructor(
    @InjectRepository(Service, CONNECTIONS_NAMES.POSTGRES)
    private readonly typeormRepo: Repository<Service>,
  ) {}

  async create(params: CreateServiceParams): Promise<Service> {
    const service = this.typeormRepo.create(params);
    return this.typeormRepo.save(service);
  }

  async update(id: string, params: UpdateServiceParams): Promise<Service> {
    await this.typeormRepo.update(id, params);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Service with id ${id} not found after update`);
    }
    return updated;
  }

  async findById(id: string): Promise<Service | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async findByCategory(categoryId: string): Promise<Service[]> {
    return this.typeormRepo.find({
      where: { categoryId },
      relations: ['category'],
    });
  }

  async list(): Promise<Service[]> {
    return this.typeormRepo.find({
      relations: ['category'],
    });
  }
}
