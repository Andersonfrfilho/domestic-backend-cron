import { Service } from '@app/modules/shared/providers/database/entities/service.entity';

export interface UpdateServiceUseCaseParams {
  id: string;
  categoryId?: string;
  name?: string;
  description?: string;
}

export interface UpdateServiceUseCaseResponse extends Service {}

export interface UpdateServiceUseCaseInterface {
  execute(params: UpdateServiceUseCaseParams): Promise<UpdateServiceUseCaseResponse>;
}
