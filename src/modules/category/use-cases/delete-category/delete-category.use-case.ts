import type { CacheProviderInterface } from '@adatechnology/cache';
import { CACHE_PROVIDER } from '@adatechnology/cache';
import { Inject, Injectable } from '@nestjs/common';

import { type CategoryRepositoryInterface } from '../../category.repository.interface';
import { CATEGORY_REPOSITORY_PROVIDE } from '../../category.token';
import { CategoryErrorFactory } from '../../factories/category.error.factory';

import { DeleteCategoryUseCaseInterface, DeleteCategoryUseCaseParams } from './delete-category.interface';

const CACHE_KEY = 'api:categories';

@Injectable()
export class DeleteCategoryUseCase implements DeleteCategoryUseCaseInterface {
  constructor(
    @Inject(CATEGORY_REPOSITORY_PROVIDE)
    private readonly categoryRepository: CategoryRepositoryInterface,
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: CacheProviderInterface,
  ) {}

  async execute(params: DeleteCategoryUseCaseParams): Promise<void> {
    const existing = await this.categoryRepository.findById(params.id);
    if (!existing) {
      throw CategoryErrorFactory.notFound(params.id);
    }

    await this.categoryRepository.deactivate(params.id);
    await this.cacheProvider.del(CACHE_KEY).catch(() => null);
  }
}
