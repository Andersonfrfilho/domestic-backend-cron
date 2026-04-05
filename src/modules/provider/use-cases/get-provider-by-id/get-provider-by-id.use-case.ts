import { Inject, Injectable } from '@nestjs/common';

import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';
import { ProviderErrorFactory } from '../../factories/provider.error.factory';

import {
  GetProviderByIdUseCaseInterface,
  GetProviderByIdUseCaseParams,
  GetProviderByIdUseCaseResponse,
} from './get-provider-by-id.interface';

@Injectable()
export class GetProviderByIdUseCase implements GetProviderByIdUseCaseInterface {
  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
  ) {}

  async execute(params: GetProviderByIdUseCaseParams): Promise<GetProviderByIdUseCaseResponse> {
    const provider = await this.providerRepository.findById(params.id);
    if (!provider) throw ProviderErrorFactory.notFound(params.id);
    return provider;
  }
}
