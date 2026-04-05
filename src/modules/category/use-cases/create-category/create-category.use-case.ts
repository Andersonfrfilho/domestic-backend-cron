import type { CacheProviderInterface } from '@adatechnology/cache';
import { CACHE_PROVIDER } from '@adatechnology/cache';
import { Inject, Injectable } from '@nestjs/common';

import { type CategoryRepositoryInterface } from '../../category.repository.interface';
import { CATEGORY_REPOSITORY_PROVIDE } from '../../category.token';
import { CategoryErrorFactory } from '../../factories/category.error.factory';

import {
  CreateCategoryUseCaseInterface,
  CreateCategoryUseCaseParams,
  CreateCategoryUseCaseResponse,
} from './create-category.interface';

const CACHE_KEY = 'api:categories';

@Injectable()
export class CreateCategoryUseCase implements CreateCategoryUseCaseInterface {
  constructor(
    @Inject(CATEGORY_REPOSITORY_PROVIDE)
    private readonly categoryRepository: CategoryRepositoryInterface,
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: CacheProviderInterface,
  ) {}

  async execute(params: CreateCategoryUseCaseParams): Promise<CreateCategoryUseCaseResponse> {
    const existing = await this.categoryRepository.findBySlug(params.slug);
    if (existing) {
      throw CategoryErrorFactory.duplicateSlug(params.slug);
    }

    const category = await this.categoryRepository.create(params);
    await this.cacheProvider.del(CACHE_KEY).catch(() => null);
    return category;
  }
}
