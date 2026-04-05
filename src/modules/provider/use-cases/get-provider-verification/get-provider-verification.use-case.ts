import { Inject, Injectable } from '@nestjs/common';

import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';
import { ProviderErrorFactory } from '../../factories/provider.error.factory';

import {
  GetProviderVerificationUseCaseInterface,
  GetProviderVerificationUseCaseParams,
  GetProviderVerificationUseCaseResponse,
} from './get-provider-verification.interface';

@Injectable()
export class GetProviderVerificationUseCase implements GetProviderVerificationUseCaseInterface {
  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
  ) {}

  async execute(params: GetProviderVerificationUseCaseParams): Promise<GetProviderVerificationUseCaseResponse> {
    const provider = await this.providerRepository.findById(params.providerId);
    if (!provider) throw ProviderErrorFactory.notFound(params.providerId);

    const verification = await this.providerRepository.getLatestVerification(params.providerId);
    if (!verification) throw ProviderErrorFactory.verificationNotFound(params.providerId);

    return verification;
  }
}
