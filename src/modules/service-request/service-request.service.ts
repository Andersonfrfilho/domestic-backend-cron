import { Inject, Injectable } from '@nestjs/common';

import { ServiceRequest } from '@modules/shared/providers/database/entities/service-request.entity';

import { type CreateServiceRequestUseCaseInterface, CreateServiceRequestUseCaseParams } from './use-cases/create-service-request/create-service-request.interface';
import { type GetServiceRequestByIdUseCaseInterface } from './use-cases/get-service-request-by-id/get-service-request-by-id.interface';
import { type ListServiceRequestsByUserUseCaseInterface } from './use-cases/list-service-requests-by-user/list-service-requests-by-user.interface';
import { type ListServiceRequestsByProviderUseCaseInterface } from './use-cases/list-service-requests-by-provider/list-service-requests-by-provider.interface';
import { type AcceptServiceRequestUseCaseInterface } from './use-cases/accept-service-request/accept-service-request.interface';
import { type RejectServiceRequestUseCaseInterface } from './use-cases/reject-service-request/reject-service-request.interface';
import { type CompleteServiceRequestUseCaseInterface } from './use-cases/complete-service-request/complete-service-request.interface';
import { type CancelServiceRequestUseCaseInterface } from './use-cases/cancel-service-request/cancel-service-request.interface';

import {
  SERVICE_REQUEST_ACCEPT_USE_CASE_PROVIDE,
  SERVICE_REQUEST_CANCEL_USE_CASE_PROVIDE,
  SERVICE_REQUEST_COMPLETE_USE_CASE_PROVIDE,
  SERVICE_REQUEST_CREATE_USE_CASE_PROVIDE,
  SERVICE_REQUEST_GET_BY_ID_USE_CASE_PROVIDE,
  SERVICE_REQUEST_LIST_BY_PROVIDER_USE_CASE_PROVIDE,
  SERVICE_REQUEST_LIST_BY_USER_USE_CASE_PROVIDE,
  SERVICE_REQUEST_REJECT_USE_CASE_PROVIDE,
} from './service-request.token';

export interface ServiceRequestServiceInterface {
  create(params: CreateServiceRequestUseCaseParams): Promise<ServiceRequest>;
  findById(id: string): Promise<ServiceRequest>;
  listByContractor(contractorId: string): Promise<ServiceRequest[]>;
  listByProvider(providerId: string): Promise<ServiceRequest[]>;
  accept(id: string, providerId: string): Promise<ServiceRequest>;
  reject(id: string, providerId: string): Promise<ServiceRequest>;
  complete(id: string, contractorId: string): Promise<ServiceRequest>;
  cancel(id: string, contractorId: string): Promise<ServiceRequest>;
}

@Injectable()
export class ServiceRequestService implements ServiceRequestServiceInterface {
  constructor(
    @Inject(SERVICE_REQUEST_CREATE_USE_CASE_PROVIDE)
    private readonly createUseCase: CreateServiceRequestUseCaseInterface,
    @Inject(SERVICE_REQUEST_GET_BY_ID_USE_CASE_PROVIDE)
    private readonly getByIdUseCase: GetServiceRequestByIdUseCaseInterface,
    @Inject(SERVICE_REQUEST_LIST_BY_USER_USE_CASE_PROVIDE)
    private readonly listByUserUseCase: ListServiceRequestsByUserUseCaseInterface,
    @Inject(SERVICE_REQUEST_LIST_BY_PROVIDER_USE_CASE_PROVIDE)
    private readonly listByProviderUseCase: ListServiceRequestsByProviderUseCaseInterface,
    @Inject(SERVICE_REQUEST_ACCEPT_USE_CASE_PROVIDE)
    private readonly acceptUseCase: AcceptServiceRequestUseCaseInterface,
    @Inject(SERVICE_REQUEST_REJECT_USE_CASE_PROVIDE)
    private readonly rejectUseCase: RejectServiceRequestUseCaseInterface,
    @Inject(SERVICE_REQUEST_COMPLETE_USE_CASE_PROVIDE)
    private readonly completeUseCase: CompleteServiceRequestUseCaseInterface,
    @Inject(SERVICE_REQUEST_CANCEL_USE_CASE_PROVIDE)
    private readonly cancelUseCase: CancelServiceRequestUseCaseInterface,
  ) {}

  create(params: CreateServiceRequestUseCaseParams): Promise<ServiceRequest> {
    return this.createUseCase.execute(params);
  }

  findById(id: string): Promise<ServiceRequest> {
    return this.getByIdUseCase.execute({ id });
  }

  listByContractor(contractorId: string): Promise<ServiceRequest[]> {
    return this.listByUserUseCase.execute({ contractorId });
  }

  listByProvider(providerId: string): Promise<ServiceRequest[]> {
    return this.listByProviderUseCase.execute({ providerId });
  }

  accept(id: string, providerId: string): Promise<ServiceRequest> {
    return this.acceptUseCase.execute({ id, providerId });
  }

  reject(id: string, providerId: string): Promise<ServiceRequest> {
    return this.rejectUseCase.execute({ id, providerId });
  }

  complete(id: string, contractorId: string): Promise<ServiceRequest> {
    return this.completeUseCase.execute({ id, contractorId });
  }

  cancel(id: string, contractorId: string): Promise<ServiceRequest> {
    return this.cancelUseCase.execute({ id, contractorId });
  }
}
