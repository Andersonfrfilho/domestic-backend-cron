import type { CacheProviderInterface } from '@adatechnology/cache';
import { CACHE_PROVIDER } from '@adatechnology/cache';
import { Inject, Injectable } from '@nestjs/common';

import { type CategoryRepositoryInterface } from '../../category.repository.interface';
import { CATEGORY_REPOSITORY_PROVIDE } from '../../category.token';
import { CategoryErrorFactory } from '../../factories/category.error.factory';

import {
  UpdateCategoryUseCaseInterface,
  UpdateCategoryUseCaseParams,
  UpdateCategoryUseCaseResponse,
} from './update-category.interface';

const CACHE_KEY = 'api:categories';

@Injectable()
export class UpdateCategoryUseCase implements UpdateCategoryUseCaseInterface {
  constructor(
    @Inject(CATEGORY_REPOSITORY_PROVIDE)
    private readonly categoryRepository: CategoryRepositoryInterface,
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: CacheProviderInterface,
  ) {}

  async execute(params: UpdateCategoryUseCaseParams): Promise<UpdateCategoryUseCaseResponse> {
    const { id, ...updateData } = params;

    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw CategoryErrorFactory.notFound(id);
    }

    if (updateData.slug && updateData.slug !== existing.slug) {
      const slugExists = await this.categoryRepository.findBySlug(updateData.slug);
      if (slugExists) {
        throw CategoryErrorFactory.duplicateSlug(updateData.slug);
      }
    }

    const updated = await this.categoryRepository.update(id, updateData);
    await this.cacheProvider.del(CACHE_KEY).catch(() => null);
    return updated;
  }
}
