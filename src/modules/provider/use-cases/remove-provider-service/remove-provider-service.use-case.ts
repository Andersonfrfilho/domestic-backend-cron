import { Inject, Injectable } from '@nestjs/common';

import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';
import { ProviderErrorFactory } from '../../factories/provider.error.factory';

import {
  RemoveProviderServiceUseCaseInterface,
  RemoveProviderServiceUseCaseParams,
} from './remove-provider-service.interface';

@Injectable()
export class RemoveProviderServiceUseCase implements RemoveProviderServiceUseCaseInterface {
  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
  ) {}

  async execute(params: RemoveProviderServiceUseCaseParams): Promise<void> {
    const provider = await this.providerRepository.findById(params.providerId);
    if (!provider) throw ProviderErrorFactory.notFound(params.providerId);

    const link = await this.providerRepository.findProviderService(params.providerId, params.serviceId);
    if (!link) throw ProviderErrorFactory.serviceNotLinked(params.serviceId);

    await this.providerRepository.removeService(params.providerId, params.serviceId);
  }
}
