import type { CacheProviderInterface } from '@adatechnology/cache';
import { CACHE_PROVIDER } from '@adatechnology/cache';
import { Inject, Injectable } from '@nestjs/common';

import { type CategoryRepositoryInterface } from '../../category.repository.interface';
import { CATEGORY_REPOSITORY_PROVIDE } from '../../category.token';

import {
  ListCategoriesUseCaseInterface,
  ListCategoriesUseCaseResponse,
} from './list-categories.interface';

const CACHE_KEY = 'api:categories';
const CACHE_TTL = 300; // 5 minutos

@Injectable()
export class ListCategoriesUseCase implements ListCategoriesUseCaseInterface {
  constructor(
    @Inject(CATEGORY_REPOSITORY_PROVIDE)
    private readonly categoryRepository: CategoryRepositoryInterface,
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: CacheProviderInterface,
  ) {}

  async execute(): Promise<ListCategoriesUseCaseResponse> {
    const cached = await this.cacheProvider.get<ListCategoriesUseCaseResponse>(CACHE_KEY);
    if (cached) {
      return cached;
    }

    const categories = await this.categoryRepository.listActive();
    await this.cacheProvider.set(CACHE_KEY, categories, CACHE_TTL);
    return categories;
  }
}
