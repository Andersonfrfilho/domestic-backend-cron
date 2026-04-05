import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { Category } from '@modules/shared/providers/database/entities/category.entity';

import { CategoryRepositoryInterface, CreateCategoryParams, UpdateCategoryParams } from './category.repository.interface';
import { CategoryErrorFactory } from './factories/category.error.factory';

@Injectable()
export class CategoryRepository implements CategoryRepositoryInterface {
  constructor(
    @InjectRepository(Category, CONNECTIONS_NAMES.POSTGRES)
    private typeormRepo: Repository<Category>,
  ) {}

  async create(params: CreateCategoryParams): Promise<Category> {
    const category = this.typeormRepo.create(params);
    return this.typeormRepo.save(category);
  }

  async update(id: string, params: UpdateCategoryParams): Promise<Category> {
    await this.typeormRepo.update(id, params);
    const updated = await this.findById(id);
    if (!updated) {
      throw CategoryErrorFactory.notFound(id);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.typeormRepo.delete(id);
  }

  async deactivate(id: string): Promise<void> {
    await this.typeormRepo.update(id, { isActive: false });
  }

  async listActive(): Promise<Category[]> {
    return this.typeormRepo.find({ where: { isActive: true } });
  }

  async list(): Promise<Category[]> {
    return this.typeormRepo.find();
  }

  async findById(id: string): Promise<Category | null> {
    return this.typeormRepo.findOne({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.typeormRepo.findOne({ where: { slug } });
  }
}

