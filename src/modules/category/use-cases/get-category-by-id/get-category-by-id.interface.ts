import { Category } from '@app/modules/shared/providers/database/entities/category.entity';

export interface GetCategoryByIdUseCaseParams {
  id: string;
}

export interface GetCategoryByIdUseCaseResponse extends Category {}

export interface GetCategoryByIdUseCaseInterface {
  execute(params: GetCategoryByIdUseCaseParams): Promise<GetCategoryByIdUseCaseResponse>;
}
