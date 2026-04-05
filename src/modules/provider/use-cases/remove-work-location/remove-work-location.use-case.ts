import { Inject, Injectable } from '@nestjs/common';

import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';
import { ProviderErrorFactory } from '../../factories/provider.error.factory';

import {
  RemoveWorkLocationUseCaseInterface,
  RemoveWorkLocationUseCaseParams,
} from './remove-work-location.interface';

@Injectable()
export class RemoveWorkLocationUseCase implements RemoveWorkLocationUseCaseInterface {
  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
  ) {}

  async execute(params: RemoveWorkLocationUseCaseParams): Promise<void> {
    const location = await this.providerRepository.findWorkLocation(params.providerId, params.locationId);
    if (!location) throw ProviderErrorFactory.workLocationNotFound(params.locationId);
    await this.providerRepository.removeWorkLocation(params.providerId, params.locationId);
  }
}
