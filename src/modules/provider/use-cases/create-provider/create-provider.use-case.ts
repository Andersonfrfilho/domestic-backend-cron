import { Inject, Injectable } from '@nestjs/common';

import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';
import { ProviderErrorFactory } from '../../factories/provider.error.factory';

import {
  CreateProviderUseCaseInterface,
  CreateProviderUseCaseParams,
  CreateProviderUseCaseResponse,
} from './create-provider.interface';

@Injectable()
export class CreateProviderUseCase implements CreateProviderUseCaseInterface {
  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
  ) {}

  async execute(params: CreateProviderUseCaseParams): Promise<CreateProviderUseCaseResponse> {
    const existing = await this.providerRepository.findByUserId(params.userId);
    if (existing) throw ProviderErrorFactory.alreadyExists(params.userId);

    const provider = await this.providerRepository.create(params);

    await this.providerRepository.createVerification({
      providerId: provider.id,
      status: 'PENDING',
    });

    return provider;
  }
}
