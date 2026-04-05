import { Inject, Injectable } from '@nestjs/common';

import { type ServiceRequestRepositoryInterface } from '../../service-request.repository.interface';
import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';

import {
  ListServiceRequestsByUserUseCaseInterface,
  ListServiceRequestsByUserUseCaseParams,
  ListServiceRequestsByUserUseCaseResponse,
} from './list-service-requests-by-user.interface';

@Injectable()
export class ListServiceRequestsByUserUseCase implements ListServiceRequestsByUserUseCaseInterface {
  constructor(
    @Inject(SERVICE_REQUEST_REPOSITORY_PROVIDE)
    private readonly serviceRequestRepository: ServiceRequestRepositoryInterface,
  ) {}

  async execute(params: ListServiceRequestsByUserUseCaseParams): Promise<ListServiceRequestsByUserUseCaseResponse> {
    return this.serviceRequestRepository.listByContractor(params.contractorId);
  }
}
