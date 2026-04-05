import { Inject, Injectable } from '@nestjs/common';

import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';
import { ProviderErrorFactory } from '../../factories/provider.error.factory';

import {
  AddProviderServiceUseCaseInterface,
  AddProviderServiceUseCaseParams,
  AddProviderServiceUseCaseResponse,
} from './add-provider-service.interface';

@Injectable()
export class AddProviderServiceUseCase implements AddProviderServiceUseCaseInterface {
  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
  ) {}

  async execute(params: AddProviderServiceUseCaseParams): Promise<AddProviderServiceUseCaseResponse> {
    const provider = await this.providerRepository.findById(params.providerId);
    if (!provider) throw ProviderErrorFactory.notFound(params.providerId);

    const existing = await this.providerRepository.findProviderService(params.providerId, params.serviceId);
    if (existing) throw ProviderErrorFactory.serviceAlreadyLinked(params.serviceId);

    return this.providerRepository.addService(params);
  }
}
