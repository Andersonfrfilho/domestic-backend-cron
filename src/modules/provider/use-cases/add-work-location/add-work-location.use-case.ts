import { Inject, Injectable } from '@nestjs/common';

import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';
import { ProviderErrorFactory } from '../../factories/provider.error.factory';

import {
  AddWorkLocationUseCaseInterface,
  AddWorkLocationUseCaseParams,
  AddWorkLocationUseCaseResponse,
} from './add-work-location.interface';

@Injectable()
export class AddWorkLocationUseCase implements AddWorkLocationUseCaseInterface {
  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
  ) {}

  async execute(params: AddWorkLocationUseCaseParams): Promise<AddWorkLocationUseCaseResponse> {
    const provider = await this.providerRepository.findById(params.providerId);
    if (!provider) throw ProviderErrorFactory.notFound(params.providerId);
    return this.providerRepository.addWorkLocation(params);
  }
}
