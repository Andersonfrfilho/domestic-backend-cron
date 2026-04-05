import { Service } from '@app/modules/shared/providers/database/entities/service.entity';

export interface ListServicesUseCaseParams {
  categoryId?: string;
}

export interface ListServicesUseCaseResponse extends Array<Service> {}

export interface ListServicesUseCaseInterface {
  execute(params: ListServicesUseCaseParams): Promise<ListServicesUseCaseResponse>;
}
