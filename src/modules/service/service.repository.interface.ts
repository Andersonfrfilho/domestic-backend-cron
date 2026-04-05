import { Service } from '@app/modules/shared/providers/database/entities/service.entity';

export interface CreateServiceParams {
  categoryId: string;
  name: string;
  description?: string;
}

export interface UpdateServiceParams {
  categoryId?: string;
  name?: string;
  description?: string;
}

export interface ServiceRepositoryInterface {
  create(params: CreateServiceParams): Promise<Service>;
  update(id: string, params: UpdateServiceParams): Promise<Service>;
  findById(id: string): Promise<Service | null>;
  findByCategory(categoryId: string): Promise<Service[]>;
  list(): Promise<Service[]>;
}
