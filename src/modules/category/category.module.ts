import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from '@app/modules/shared/providers/database/entities/category.entity';
import { SharedModule } from '@modules/shared/shared.module';

import { CONNECTIONS_NAMES } from '../shared/providers/database/database.constant';

import { CategoryController } from './category.controller';
import { CategoryRepository } from './category.repository';
import { CategoryService } from './category.service';
import {
  CATEGORY_CREATE_USE_CASE_PROVIDE,
  CATEGORY_DELETE_USE_CASE_PROVIDE,
  CATEGORY_GET_BY_ID_USE_CASE_PROVIDE,
  CATEGORY_LIST_USE_CASE_PROVIDE,
  CATEGORY_REPOSITORY_PROVIDE,
  CATEGORY_SERVICE_PROVIDE,
  CATEGORY_UPDATE_USE_CASE_PROVIDE,
} from './category.token';
import { CreateCategoryUseCase } from './use-cases/create-category/create-category.use-case';
import { DeleteCategoryUseCase } from './use-cases/delete-category/delete-category.use-case';
import { GetCategoryByIdUseCase } from './use-cases/get-category-by-id/get-category-by-id.use-case';
import { ListCategoriesUseCase } from './use-cases/list-categories/list-categories.use-case';
import { UpdateCategoryUseCase } from './use-cases/update-category/update-category.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category], CONNECTIONS_NAMES.POSTGRES),
    SharedModule,
  ],
  controllers: [CategoryController],
  providers: [
    { provide: CATEGORY_REPOSITORY_PROVIDE, useClass: CategoryRepository },
    { provide: CATEGORY_CREATE_USE_CASE_PROVIDE, useClass: CreateCategoryUseCase },
    { provide: CATEGORY_UPDATE_USE_CASE_PROVIDE, useClass: UpdateCategoryUseCase },
    { provide: CATEGORY_DELETE_USE_CASE_PROVIDE, useClass: DeleteCategoryUseCase },
    { provide: CATEGORY_LIST_USE_CASE_PROVIDE, useClass: ListCategoriesUseCase },
    { provide: CATEGORY_GET_BY_ID_USE_CASE_PROVIDE, useClass: GetCategoryByIdUseCase },
    { provide: CATEGORY_SERVICE_PROVIDE, useClass: CategoryService },
  ],
  exports: [CATEGORY_REPOSITORY_PROVIDE, CATEGORY_SERVICE_PROVIDE],
})
export class CategoryModule {}
