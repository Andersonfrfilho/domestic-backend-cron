import { Inject, Injectable } from '@nestjs/common';

import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';
import { ProviderErrorFactory } from '../../factories/provider.error.factory';

import {
  SubmitVerificationUseCaseInterface,
  SubmitVerificationUseCaseParams,
  SubmitVerificationUseCaseResponse,
} from './submit-verification.interface';

@Injectable()
export class SubmitVerificationUseCase implements SubmitVerificationUseCaseInterface {
  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
  ) {}

  async execute(params: SubmitVerificationUseCaseParams): Promise<SubmitVerificationUseCaseResponse> {
    const provider = await this.providerRepository.findById(params.providerId);
    if (!provider) throw ProviderErrorFactory.notFound(params.providerId);

    const verification = await this.providerRepository.getLatestVerification(params.providerId);
    if (!verification) throw ProviderErrorFactory.verificationNotFound(params.providerId);

    if (verification.status !== 'PENDING') {
      throw ProviderErrorFactory.invalidVerificationStatus(verification.status);
    }

    return this.providerRepository.updateVerification(verification.id, {
      status: 'UNDER_REVIEW',
    });
  }
}
