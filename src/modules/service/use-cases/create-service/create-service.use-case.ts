import { Inject, Injectable } from '@nestjs/common';

import { CATEGORY_REPOSITORY_PROVIDE } from '@modules/category/category.token';
import { type CategoryRepositoryInterface } from '@modules/category/category.repository.interface';
import { SERVICE_REPOSITORY_PROVIDE } from '@modules/service/service.token';
import { type ServiceRepositoryInterface } from '@modules/service/service.repository.interface';
import { ServiceErrorFactory } from '@modules/service/factories/service.error.factory';

import {
  CreateServiceUseCaseInterface,
  CreateServiceUseCaseParams,
  CreateServiceUseCaseResponse,
} from './create-service.interface';

@Injectable()
export class CreateServiceUseCase implements CreateServiceUseCaseInterface {
  constructor(
    @Inject(SERVICE_REPOSITORY_PROVIDE)
    private readonly serviceRepository: ServiceRepositoryInterface,
    @Inject(CATEGORY_REPOSITORY_PROVIDE)
    private readonly categoryRepository: CategoryRepositoryInterface,
  ) {}

  async execute(params: CreateServiceUseCaseParams): Promise<CreateServiceUseCaseResponse> {
    const category = await this.categoryRepository.findById(params.categoryId);
    if (!category) {
      throw ServiceErrorFactory.categoryNotFound(params.categoryId);
    }

    return this.serviceRepository.create(params);
  }
}
