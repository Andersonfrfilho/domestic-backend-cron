import { Inject, Injectable } from '@nestjs/common';

import { CATEGORY_REPOSITORY_PROVIDE } from '@modules/category/category.token';
import { type CategoryRepositoryInterface } from '@modules/category/category.repository.interface';
import { SERVICE_REPOSITORY_PROVIDE } from '@modules/service/service.token';
import { type ServiceRepositoryInterface } from '@modules/service/service.repository.interface';
import { ServiceErrorFactory } from '@modules/service/factories/service.error.factory';

import {
  UpdateServiceUseCaseInterface,
  UpdateServiceUseCaseParams,
  UpdateServiceUseCaseResponse,
} from './update-service.interface';

@Injectable()
export class UpdateServiceUseCase implements UpdateServiceUseCaseInterface {
  constructor(
    @Inject(SERVICE_REPOSITORY_PROVIDE)
    private readonly serviceRepository: ServiceRepositoryInterface,
    @Inject(CATEGORY_REPOSITORY_PROVIDE)
    private readonly categoryRepository: CategoryRepositoryInterface,
  ) {}

  async execute(params: UpdateServiceUseCaseParams): Promise<UpdateServiceUseCaseResponse> {
    const { id, ...updateData } = params;

    const existing = await this.serviceRepository.findById(id);
    if (!existing) {
      throw ServiceErrorFactory.notFound(id);
    }

    if (updateData.categoryId) {
      const category = await this.categoryRepository.findById(updateData.categoryId);
      if (!category) {
        throw ServiceErrorFactory.categoryNotFound(updateData.categoryId);
      }
    }

    return this.serviceRepository.update(id, updateData);
  }
}
