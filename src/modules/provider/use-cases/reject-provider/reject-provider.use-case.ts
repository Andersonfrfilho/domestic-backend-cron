import { Inject, Injectable } from '@nestjs/common';

import { type QueueProducerMessageProviderInterface } from '@modules/shared/providers/queue/producer/producer.interface';
import { QUEUE_PRODUCER_PROVIDER } from '@modules/shared/providers/queue/producer/producer.token';

import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';
import { ProviderErrorFactory } from '../../factories/provider.error.factory';

import {
  RejectProviderUseCaseInterface,
  RejectProviderUseCaseParams,
  RejectProviderUseCaseResponse,
} from './reject-provider.interface';

const EXCHANGE = 'zolve.events';
const ROUTING_KEY = 'provider.rejected';

@Injectable()
export class RejectProviderUseCase implements RejectProviderUseCaseInterface {
  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
    @Inject(QUEUE_PRODUCER_PROVIDER)
    private readonly producer: QueueProducerMessageProviderInterface,
  ) {}

  async execute(params: RejectProviderUseCaseParams): Promise<RejectProviderUseCaseResponse> {
    const provider = await this.providerRepository.findById(params.providerId);
    if (!provider) throw ProviderErrorFactory.notFound(params.providerId);

    const verification = await this.providerRepository.getLatestVerification(params.providerId);
    if (!verification) throw ProviderErrorFactory.verificationNotFound(params.providerId);

    if (verification.status !== 'UNDER_REVIEW') {
      throw ProviderErrorFactory.invalidVerificationStatus(verification.status);
    }

    const updated = await this.providerRepository.updateVerification(verification.id, {
      status: 'REJECTED',
      reviewedBy: params.reviewedBy,
      notes: params.reason,
      reviewedAt: new Date(),
    });

    await this.producer.send(
      ROUTING_KEY,
      {
        body: {
          provider_id: provider.id,
          user_id: provider.userId,
          reason: params.reason,
        },
      },
      { exchange: EXCHANGE, routingKey: ROUTING_KEY },
    ).catch(() => null);

    return updated;
  }
}
