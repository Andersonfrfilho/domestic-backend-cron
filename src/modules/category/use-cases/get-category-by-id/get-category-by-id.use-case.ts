import { Inject, Injectable } from '@nestjs/common';

import { type CategoryRepositoryInterface } from '../../category.repository.interface';
import { CATEGORY_REPOSITORY_PROVIDE } from '../../category.token';
import { CategoryErrorFactory } from '../../factories/category.error.factory';

import {
  GetCategoryByIdUseCaseInterface,
  GetCategoryByIdUseCaseParams,
  GetCategoryByIdUseCaseResponse,
} from './get-category-by-id.interface';

@Injectable()
export class GetCategoryByIdUseCase implements GetCategoryByIdUseCaseInterface {
  constructor(
    @Inject(CATEGORY_REPOSITORY_PROVIDE)
    private readonly categoryRepository: CategoryRepositoryInterface,
  ) {}

  async execute(params: GetCategoryByIdUseCaseParams): Promise<GetCategoryByIdUseCaseResponse> {
    const category = await this.categoryRepository.findById(params.id);
    if (!category) {
      throw CategoryErrorFactory.notFound(params.id);
    }
    return category;
  }
}
