import { Inject, Injectable } from '@nestjs/common';

import { SERVICE_REPOSITORY_PROVIDE } from '@modules/service/service.token';
import { type ServiceRepositoryInterface } from '@modules/service/service.repository.interface';
import { ServiceErrorFactory } from '@modules/service/factories/service.error.factory';

import {
  GetServiceByIdUseCaseInterface,
  GetServiceByIdUseCaseParams,
  GetServiceByIdUseCaseResponse,
} from './get-service-by-id.interface';

@Injectable()
export class GetServiceByIdUseCase implements GetServiceByIdUseCaseInterface {
  constructor(
    @Inject(SERVICE_REPOSITORY_PROVIDE)
    private readonly serviceRepository: ServiceRepositoryInterface,
  ) {}

  async execute(params: GetServiceByIdUseCaseParams): Promise<GetServiceByIdUseCaseResponse> {
    const service = await this.serviceRepository.findById(params.id);
    if (!service) {
      throw ServiceErrorFactory.notFound(params.id);
    }
    return service;
  }
}
