import { Category } from '@app/modules/shared/providers/database/entities/category.entity';

export interface UpdateCategoryUseCaseParams {
  id: string;
  name?: string;
  slug?: string;
  iconUrl?: string;
}

export interface UpdateCategoryUseCaseResponse extends Category {}

export interface UpdateCategoryUseCaseInterface {
  execute(params: UpdateCategoryUseCaseParams): Promise<UpdateCategoryUseCaseResponse>;
}
