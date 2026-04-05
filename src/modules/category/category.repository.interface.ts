import { Category } from '@app/modules/shared/providers/database/entities/category.entity';

export interface CreateCategoryParams {
  name: string;
  slug: string;
  iconUrl?: string;
}

export interface UpdateCategoryParams {
  name?: string;
  slug?: string;
  iconUrl?: string;
}

export interface CategoryRepositoryInterface {
  create(params: CreateCategoryParams): Promise<Category>;
  update(id: string, params: UpdateCategoryParams): Promise<Category>;
  delete(id: string): Promise<void>;
  deactivate(id: string): Promise<void>;
  listActive(): Promise<Category[]>;
  list(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
}

