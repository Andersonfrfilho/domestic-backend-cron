import { Inject, Injectable } from '@nestjs/common';

import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';
import { ProviderErrorFactory } from '../../factories/provider.error.factory';

import {
  UpdateProviderUseCaseInterface,
  UpdateProviderUseCaseParams,
  UpdateProviderUseCaseResponse,
} from './update-provider.interface';

@Injectable()
export class UpdateProviderUseCase implements UpdateProviderUseCaseInterface {
  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
  ) {}

  async execute(params: UpdateProviderUseCaseParams): Promise<UpdateProviderUseCaseResponse> {
    const { id, ...updateParams } = params;
    const existing = await this.providerRepository.findById(id);
    if (!existing) throw ProviderErrorFactory.notFound(id);
    return this.providerRepository.update(id, updateParams);
  }
}
