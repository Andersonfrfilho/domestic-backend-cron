import { Inject, Injectable } from '@nestjs/common';

import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';

import {
  ListProvidersUseCaseInterface,
  ListProvidersUseCaseResponse,
} from './list-providers.interface';

@Injectable()
export class ListProvidersUseCase implements ListProvidersUseCaseInterface {
  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
  ) {}

  async execute(): Promise<ListProvidersUseCaseResponse> {
    return this.providerRepository.listApproved();
  }
}
