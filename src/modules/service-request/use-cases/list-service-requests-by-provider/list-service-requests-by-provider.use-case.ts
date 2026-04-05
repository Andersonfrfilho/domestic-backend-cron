import { Inject, Injectable } from '@nestjs/common';

import { type ServiceRequestRepositoryInterface } from '../../service-request.repository.interface';
import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';

import {
  ListServiceRequestsByProviderUseCaseInterface,
  ListServiceRequestsByProviderUseCaseParams,
  ListServiceRequestsByProviderUseCaseResponse,
} from './list-service-requests-by-provider.interface';

@Injectable()
export class ListServiceRequestsByProviderUseCase implements ListServiceRequestsByProviderUseCaseInterface {
  constructor(
    @Inject(SERVICE_REQUEST_REPOSITORY_PROVIDE)
    private readonly serviceRequestRepository: ServiceRequestRepositoryInterface,
  ) {}

  async execute(params: ListServiceRequestsByProviderUseCaseParams): Promise<ListServiceRequestsByProviderUseCaseResponse> {
    return this.serviceRequestRepository.listByProvider(params.providerId);
  }
}
