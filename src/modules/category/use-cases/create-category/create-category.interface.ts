import { Category } from '@app/modules/shared/providers/database/entities/category.entity';

export interface CreateCategoryUseCaseParams {
  name: string;
  slug: string;
  iconUrl?: string;
}

export interface CreateCategoryUseCaseResponse extends Category {}

export interface CreateCategoryUseCaseInterface {
  execute(params: CreateCategoryUseCaseParams): Promise<CreateCategoryUseCaseResponse>;
}
