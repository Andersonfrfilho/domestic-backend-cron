import { Service } from '@app/modules/shared/providers/database/entities/service.entity';
import { Inject, Injectable } from '@nestjs/common';

import {
  type CreateServiceUseCaseInterface,
  CreateServiceUseCaseParams,
} from './use-cases/create-service/create-service.interface';
import { type GetServiceByIdUseCaseInterface } from './use-cases/get-service-by-id/get-service-by-id.interface';
import {
  type ListServicesUseCaseInterface,
  ListServicesUseCaseParams,
} from './use-cases/list-services/list-services.interface';
import {
  type UpdateServiceUseCaseInterface,
  UpdateServiceUseCaseParams,
} from './use-cases/update-service/update-service.interface';

import {
  SERVICE_CREATE_USE_CASE_PROVIDE,
  SERVICE_GET_BY_ID_USE_CASE_PROVIDE,
  SERVICE_LIST_USE_CASE_PROVIDE,
  SERVICE_UPDATE_USE_CASE_PROVIDE,
} from './service.token';

export interface ServiceServiceInterface {
  create(params: CreateServiceUseCaseParams): Promise<Service>;
  update(params: UpdateServiceUseCaseParams): Promise<Service>;
  list(params: ListServicesUseCaseParams): Promise<Service[]>;
  findById(id: string): Promise<Service>;
}

@Injectable()
export class ServiceService implements ServiceServiceInterface {
  constructor(
    @Inject(SERVICE_CREATE_USE_CASE_PROVIDE)
    private readonly createUseCase: CreateServiceUseCaseInterface,
    @Inject(SERVICE_UPDATE_USE_CASE_PROVIDE)
    private readonly updateUseCase: UpdateServiceUseCaseInterface,
    @Inject(SERVICE_LIST_USE_CASE_PROVIDE)
    private readonly listUseCase: ListServicesUseCaseInterface,
    @Inject(SERVICE_GET_BY_ID_USE_CASE_PROVIDE)
    private readonly getByIdUseCase: GetServiceByIdUseCaseInterface,
  ) {}

  async create(params: CreateServiceUseCaseParams): Promise<Service> {
    return this.createUseCase.execute(params);
  }

  async update(params: UpdateServiceUseCaseParams): Promise<Service> {
    return this.updateUseCase.execute(params);
  }

  async list(params: ListServicesUseCaseParams): Promise<Service[]> {
    return this.listUseCase.execute(params);
  }

  async findById(id: string): Promise<Service> {
    return this.getByIdUseCase.execute({ id });
  }
}
