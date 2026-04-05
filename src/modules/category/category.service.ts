import { Category } from '@app/modules/shared/providers/database/entities/category.entity';
import { Inject, Injectable } from '@nestjs/common';

import {
  type CreateCategoryUseCaseInterface,
  CreateCategoryUseCaseParams,
} from './use-cases/create-category/create-category.interface';
import { type DeleteCategoryUseCaseInterface } from './use-cases/delete-category/delete-category.interface';
import { type GetCategoryByIdUseCaseInterface } from './use-cases/get-category-by-id/get-category-by-id.interface';
import { type ListCategoriesUseCaseInterface } from './use-cases/list-categories/list-categories.interface';
import {
  type UpdateCategoryUseCaseInterface,
  UpdateCategoryUseCaseParams,
} from './use-cases/update-category/update-category.interface';

import {
  CATEGORY_CREATE_USE_CASE_PROVIDE,
  CATEGORY_DELETE_USE_CASE_PROVIDE,
  CATEGORY_GET_BY_ID_USE_CASE_PROVIDE,
  CATEGORY_LIST_USE_CASE_PROVIDE,
  CATEGORY_UPDATE_USE_CASE_PROVIDE,
} from './category.token';

export interface CategoryServiceInterface {
  create(params: CreateCategoryUseCaseParams): Promise<Category>;
  update(params: UpdateCategoryUseCaseParams): Promise<Category>;
  delete(id: string): Promise<void>;
  list(): Promise<Category[]>;
  findById(id: string): Promise<Category>;
}

@Injectable()
export class CategoryService implements CategoryServiceInterface {
  constructor(
    @Inject(CATEGORY_CREATE_USE_CASE_PROVIDE)
    private readonly createUseCase: CreateCategoryUseCaseInterface,
    @Inject(CATEGORY_UPDATE_USE_CASE_PROVIDE)
    private readonly updateUseCase: UpdateCategoryUseCaseInterface,
    @Inject(CATEGORY_DELETE_USE_CASE_PROVIDE)
    private readonly deleteUseCase: DeleteCategoryUseCaseInterface,
    @Inject(CATEGORY_LIST_USE_CASE_PROVIDE)
    private readonly listUseCase: ListCategoriesUseCaseInterface,
    @Inject(CATEGORY_GET_BY_ID_USE_CASE_PROVIDE)
    private readonly getByIdUseCase: GetCategoryByIdUseCaseInterface,
  ) {}

  async create(params: CreateCategoryUseCaseParams): Promise<Category> {
    return this.createUseCase.execute(params);
  }

  async update(params: UpdateCategoryUseCaseParams): Promise<Category> {
    return this.updateUseCase.execute(params);
  }

  async delete(id: string): Promise<void> {
    return this.deleteUseCase.execute({ id });
  }

  async list(): Promise<Category[]> {
    return this.listUseCase.execute();
  }

  async findById(id: string): Promise<Category> {
    return this.getByIdUseCase.execute({ id });
  }
}
