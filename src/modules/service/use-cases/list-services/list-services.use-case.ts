import { Inject, Injectable } from '@nestjs/common';

import { SERVICE_REPOSITORY_PROVIDE } from '@modules/service/service.token';
import { type ServiceRepositoryInterface } from '@modules/service/service.repository.interface';

import {
  ListServicesUseCaseInterface,
  ListServicesUseCaseParams,
  ListServicesUseCaseResponse,
} from './list-services.interface';

@Injectable()
export class ListServicesUseCase implements ListServicesUseCaseInterface {
  constructor(
    @Inject(SERVICE_REPOSITORY_PROVIDE)
    private readonly serviceRepository: ServiceRepositoryInterface,
  ) {}

  async execute(params: ListServicesUseCaseParams): Promise<ListServicesUseCaseResponse> {
    if (params.categoryId) {
      return this.serviceRepository.findByCategory(params.categoryId);
    }
    return this.serviceRepository.list();
  }
}
