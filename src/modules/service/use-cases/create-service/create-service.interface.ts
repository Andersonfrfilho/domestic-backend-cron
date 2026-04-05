import { Service } from '@app/modules/shared/providers/database/entities/service.entity';

export interface CreateServiceUseCaseParams {
  categoryId: string;
  name: string;
  description?: string;
}

export interface CreateServiceUseCaseResponse extends Service {}

export interface CreateServiceUseCaseInterface {
  execute(params: CreateServiceUseCaseParams): Promise<CreateServiceUseCaseResponse>;
}
