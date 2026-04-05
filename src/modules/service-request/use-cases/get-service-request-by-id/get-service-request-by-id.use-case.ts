import { Inject, Injectable } from '@nestjs/common';

import { type ServiceRequestRepositoryInterface } from '../../service-request.repository.interface';
import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';
import { ServiceRequestErrorFactory } from '../../factories/service-request.error.factory';

import {
  GetServiceRequestByIdUseCaseInterface,
  GetServiceRequestByIdUseCaseParams,
  GetServiceRequestByIdUseCaseResponse,
} from './get-service-request-by-id.interface';

@Injectable()
export class GetServiceRequestByIdUseCase implements GetServiceRequestByIdUseCaseInterface {
  constructor(
    @Inject(SERVICE_REQUEST_REPOSITORY_PROVIDE)
    private readonly serviceRequestRepository: ServiceRequestRepositoryInterface,
  ) {}

  async execute(params: GetServiceRequestByIdUseCaseParams): Promise<GetServiceRequestByIdUseCaseResponse> {
    const serviceRequest = await this.serviceRequestRepository.findById(params.id);
    if (!serviceRequest) throw ServiceRequestErrorFactory.notFound(params.id);
    return serviceRequest;
  }
}
