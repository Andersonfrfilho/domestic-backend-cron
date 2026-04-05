import { Inject, Injectable } from '@nestjs/common';

import { type ServiceRequestRepositoryInterface } from '../../service-request.repository.interface';
import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';
import { ServiceRequestErrorFactory } from '../../factories/service-request.error.factory';

import {
  RejectServiceRequestUseCaseInterface,
  RejectServiceRequestUseCaseParams,
  RejectServiceRequestUseCaseResponse,
} from './reject-service-request.interface';

@Injectable()
export class RejectServiceRequestUseCase implements RejectServiceRequestUseCaseInterface {
  constructor(
    @Inject(SERVICE_REQUEST_REPOSITORY_PROVIDE)
    private readonly serviceRequestRepository: ServiceRequestRepositoryInterface,
  ) {}

  async execute(params: RejectServiceRequestUseCaseParams): Promise<RejectServiceRequestUseCaseResponse> {
    const serviceRequest = await this.serviceRequestRepository.findById(params.id);
    if (!serviceRequest) throw ServiceRequestErrorFactory.notFound(params.id);

    if (serviceRequest.providerId !== params.providerId) {
      throw ServiceRequestErrorFactory.notAuthorized();
    }

    if (serviceRequest.status !== 'PENDING') {
      throw ServiceRequestErrorFactory.invalidStatusTransition(serviceRequest.status, 'REJECTED');
    }

    return this.serviceRequestRepository.updateStatus(params.id, 'REJECTED');
  }
}
