import { Category } from '@app/modules/shared/providers/database/entities/category.entity';

export interface ListCategoriesUseCaseResponse extends Array<Category> {}

export interface ListCategoriesUseCaseInterface {
  execute(): Promise<ListCategoriesUseCaseResponse>;
}
