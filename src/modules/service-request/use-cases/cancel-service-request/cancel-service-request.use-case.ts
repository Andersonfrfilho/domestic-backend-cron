import { Inject, Injectable } from '@nestjs/common';

import { type ServiceRequestRepositoryInterface } from '../../service-request.repository.interface';
import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';
import { ServiceRequestErrorFactory } from '../../factories/service-request.error.factory';

import {
  CancelServiceRequestUseCaseInterface,
  CancelServiceRequestUseCaseParams,
  CancelServiceRequestUseCaseResponse,
} from './cancel-service-request.interface';

const CANCELLABLE_STATUSES = ['PENDING', 'ACCEPTED'];

@Injectable()
export class CancelServiceRequestUseCase implements CancelServiceRequestUseCaseInterface {
  constructor(
    @Inject(SERVICE_REQUEST_REPOSITORY_PROVIDE)
    private readonly serviceRequestRepository: ServiceRequestRepositoryInterface,
  ) {}

  async execute(params: CancelServiceRequestUseCaseParams): Promise<CancelServiceRequestUseCaseResponse> {
    const serviceRequest = await this.serviceRequestRepository.findById(params.id);
    if (!serviceRequest) throw ServiceRequestErrorFactory.notFound(params.id);

    if (serviceRequest.contractorId !== params.contractorId) {
      throw ServiceRequestErrorFactory.notAuthorized();
    }

    if (!CANCELLABLE_STATUSES.includes(serviceRequest.status)) {
      throw ServiceRequestErrorFactory.invalidStatusTransition(serviceRequest.status, 'CANCELLED');
    }

    return this.serviceRequestRepository.updateStatus(params.id, 'CANCELLED');
  }
}
