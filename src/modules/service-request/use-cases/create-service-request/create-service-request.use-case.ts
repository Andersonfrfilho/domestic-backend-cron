import { Inject, Injectable } from '@nestjs/common';

import { type ProviderRepositoryInterface } from '@modules/provider/provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '@modules/provider/provider.token';
import { type QueueProducerMessageProviderInterface } from '@modules/shared/providers/queue/producer/producer.interface';
import { QUEUE_PRODUCER_PROVIDER } from '@modules/shared/providers/queue/producer/producer.token';

import { type ServiceRequestRepositoryInterface } from '../../service-request.repository.interface';
import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';
import { ServiceRequestErrorFactory } from '../../factories/service-request.error.factory';

import {
  CreateServiceRequestUseCaseInterface,
  CreateServiceRequestUseCaseParams,
  CreateServiceRequestUseCaseResponse,
} from './create-service-request.interface';

const EXCHANGE = 'zolve.events';
const ROUTING_KEY = 'service_request.created';

@Injectable()
export class CreateServiceRequestUseCase implements CreateServiceRequestUseCaseInterface {
  constructor(
    @Inject(SERVICE_REQUEST_REPOSITORY_PROVIDE)
    private readonly serviceRequestRepository: ServiceRequestRepositoryInterface,
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
    @Inject(QUEUE_PRODUCER_PROVIDER)
    private readonly producer: QueueProducerMessageProviderInterface,
  ) {}

  async execute(params: CreateServiceRequestUseCaseParams): Promise<CreateServiceRequestUseCaseResponse> {
    const verification = await this.providerRepository.getLatestVerification(params.providerId);
    if (!verification || verification.status !== 'APPROVED') {
      throw ServiceRequestErrorFactory.providerNotApproved(params.providerId);
    }

    const serviceRequest = await this.serviceRequestRepository.create(params);

    await this.producer.send(
      ROUTING_KEY,
      {
        body: {
          service_request_id: serviceRequest.id,
          contractor_id: serviceRequest.contractorId,
          provider_id: serviceRequest.providerId,
          service_id: serviceRequest.serviceId,
        },
      },
      { exchange: EXCHANGE, routingKey: ROUTING_KEY },
    ).catch(() => null);

    return serviceRequest;
  }
}
