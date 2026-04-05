import { Inject, Injectable } from '@nestjs/common';

import { type QueueProducerMessageProviderInterface } from '@modules/shared/providers/queue/producer/producer.interface';
import { QUEUE_PRODUCER_PROVIDER } from '@modules/shared/providers/queue/producer/producer.token';

import { type ServiceRequestRepositoryInterface } from '../../service-request.repository.interface';
import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';
import { ServiceRequestErrorFactory } from '../../factories/service-request.error.factory';

import {
  CompleteServiceRequestUseCaseInterface,
  CompleteServiceRequestUseCaseParams,
  CompleteServiceRequestUseCaseResponse,
} from './complete-service-request.interface';

const EXCHANGE = 'zolve.events';
const ROUTING_KEY = 'service_request.completed';

@Injectable()
export class CompleteServiceRequestUseCase implements CompleteServiceRequestUseCaseInterface {
  constructor(
    @Inject(SERVICE_REQUEST_REPOSITORY_PROVIDE)
    private readonly serviceRequestRepository: ServiceRequestRepositoryInterface,
    @Inject(QUEUE_PRODUCER_PROVIDER)
    private readonly producer: QueueProducerMessageProviderInterface,
  ) {}

  async execute(params: CompleteServiceRequestUseCaseParams): Promise<CompleteServiceRequestUseCaseResponse> {
    const serviceRequest = await this.serviceRequestRepository.findById(params.id);
    if (!serviceRequest) throw ServiceRequestErrorFactory.notFound(params.id);

    if (serviceRequest.contractorId !== params.contractorId) {
      throw ServiceRequestErrorFactory.notAuthorized();
    }

    if (serviceRequest.status !== 'ACCEPTED') {
      throw ServiceRequestErrorFactory.invalidStatusTransition(serviceRequest.status, 'COMPLETED');
    }

    const completed = await this.serviceRequestRepository.updateStatus(params.id, 'COMPLETED');

    await this.producer.send(
      ROUTING_KEY,
      {
        body: {
          service_request_id: completed.id,
          contractor_id: completed.contractorId,
          provider_id: completed.providerId,
          service_id: completed.serviceId,
        },
      },
      { exchange: EXCHANGE, routingKey: ROUTING_KEY },
    ).catch(() => null);

    return completed;
  }
}
