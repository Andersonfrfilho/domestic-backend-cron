import { Inject, Injectable } from '@nestjs/common';

import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';

import {
  ListPendingProvidersUseCaseInterface,
  ListPendingProvidersUseCaseResponse,
} from './list-pending-providers.interface';

@Injectable()
export class ListPendingProvidersUseCase implements ListPendingProvidersUseCaseInterface {
  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
  ) {}

  async execute(): Promise<ListPendingProvidersUseCaseResponse> {
    return this.providerRepository.listUnderReview();
  }
}
