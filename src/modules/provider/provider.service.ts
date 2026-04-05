import { Inject, Injectable } from '@nestjs/common';

import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';
import { ProviderService as ProviderServiceEntity } from '@modules/shared/providers/database/entities/provider-service.entity';
import { ProviderVerification } from '@modules/shared/providers/database/entities/provider-verification.entity';
import { ProviderWorkLocation } from '@modules/shared/providers/database/entities/provider-work-location.entity';

import { type ProviderRepositoryInterface } from './provider.repository.interface';

import { type CreateProviderUseCaseInterface, CreateProviderUseCaseParams } from './use-cases/create-provider/create-provider.interface';
import { type GetProviderByIdUseCaseInterface } from './use-cases/get-provider-by-id/get-provider-by-id.interface';
import { type ListProvidersUseCaseInterface } from './use-cases/list-providers/list-providers.interface';
import { type UpdateProviderUseCaseInterface, UpdateProviderUseCaseParams } from './use-cases/update-provider/update-provider.interface';
import { type AddProviderServiceUseCaseInterface, AddProviderServiceUseCaseParams } from './use-cases/add-provider-service/add-provider-service.interface';
import { type RemoveProviderServiceUseCaseInterface } from './use-cases/remove-provider-service/remove-provider-service.interface';
import { type AddWorkLocationUseCaseInterface, AddWorkLocationUseCaseParams } from './use-cases/add-work-location/add-work-location.interface';
import { type RemoveWorkLocationUseCaseInterface } from './use-cases/remove-work-location/remove-work-location.interface';
import { type SubmitVerificationUseCaseInterface } from './use-cases/submit-verification/submit-verification.interface';
import { type ApproveProviderUseCaseInterface, ApproveProviderUseCaseParams } from './use-cases/approve-provider/approve-provider.interface';
import { type RejectProviderUseCaseInterface, RejectProviderUseCaseParams } from './use-cases/reject-provider/reject-provider.interface';
import { type ListPendingProvidersUseCaseInterface } from './use-cases/list-pending-providers/list-pending-providers.interface';
import { type GetProviderVerificationUseCaseInterface } from './use-cases/get-provider-verification/get-provider-verification.interface';

import {
  PROVIDER_ADD_SERVICE_USE_CASE_PROVIDE,
  PROVIDER_ADD_WORK_LOCATION_USE_CASE_PROVIDE,
  PROVIDER_APPROVE_USE_CASE_PROVIDE,
  PROVIDER_CREATE_USE_CASE_PROVIDE,
  PROVIDER_GET_BY_ID_USE_CASE_PROVIDE,
  PROVIDER_GET_VERIFICATION_USE_CASE_PROVIDE,
  PROVIDER_LIST_PENDING_USE_CASE_PROVIDE,
  PROVIDER_LIST_USE_CASE_PROVIDE,
  PROVIDER_REJECT_USE_CASE_PROVIDE,
  PROVIDER_REMOVE_SERVICE_USE_CASE_PROVIDE,
  PROVIDER_REMOVE_WORK_LOCATION_USE_CASE_PROVIDE,
  PROVIDER_SUBMIT_VERIFICATION_USE_CASE_PROVIDE,
  PROVIDER_UPDATE_USE_CASE_PROVIDE,
  PROVIDER_REPOSITORY_PROVIDE,
} from './provider.token';

export interface ProviderServiceInterface {
  create(params: CreateProviderUseCaseParams): Promise<ProviderProfile>;
  findById(id: string): Promise<ProviderProfile>;
  list(): Promise<ProviderProfile[]>;
  update(params: UpdateProviderUseCaseParams): Promise<ProviderProfile>;
  addService(params: AddProviderServiceUseCaseParams): Promise<ProviderServiceEntity>;
  removeService(providerId: string, serviceId: string): Promise<void>;
  listServices(providerId: string): Promise<ProviderServiceEntity[]>;
  addWorkLocation(params: AddWorkLocationUseCaseParams): Promise<ProviderWorkLocation>;
  removeWorkLocation(providerId: string, locationId: string): Promise<void>;
  listWorkLocations(providerId: string): Promise<ProviderWorkLocation[]>;
  submitVerification(providerId: string): Promise<ProviderVerification>;
  getVerification(providerId: string): Promise<ProviderVerification>;
  approve(params: ApproveProviderUseCaseParams): Promise<ProviderVerification>;
  reject(params: RejectProviderUseCaseParams): Promise<ProviderVerification>;
  listPending(): Promise<ProviderProfile[]>;
}

@Injectable()
export class ProviderService implements ProviderServiceInterface {
  constructor(
    @Inject(PROVIDER_CREATE_USE_CASE_PROVIDE)
    private readonly createUseCase: CreateProviderUseCaseInterface,
    @Inject(PROVIDER_GET_BY_ID_USE_CASE_PROVIDE)
    private readonly getByIdUseCase: GetProviderByIdUseCaseInterface,
    @Inject(PROVIDER_LIST_USE_CASE_PROVIDE)
    private readonly listUseCase: ListProvidersUseCaseInterface,
    @Inject(PROVIDER_UPDATE_USE_CASE_PROVIDE)
    private readonly updateUseCase: UpdateProviderUseCaseInterface,
    @Inject(PROVIDER_ADD_SERVICE_USE_CASE_PROVIDE)
    private readonly addServiceUseCase: AddProviderServiceUseCaseInterface,
    @Inject(PROVIDER_REMOVE_SERVICE_USE_CASE_PROVIDE)
    private readonly removeServiceUseCase: RemoveProviderServiceUseCaseInterface,
    @Inject(PROVIDER_ADD_WORK_LOCATION_USE_CASE_PROVIDE)
    private readonly addWorkLocationUseCase: AddWorkLocationUseCaseInterface,
    @Inject(PROVIDER_REMOVE_WORK_LOCATION_USE_CASE_PROVIDE)
    private readonly removeWorkLocationUseCase: RemoveWorkLocationUseCaseInterface,
    @Inject(PROVIDER_SUBMIT_VERIFICATION_USE_CASE_PROVIDE)
    private readonly submitVerificationUseCase: SubmitVerificationUseCaseInterface,
    @Inject(PROVIDER_GET_VERIFICATION_USE_CASE_PROVIDE)
    private readonly getVerificationUseCase: GetProviderVerificationUseCaseInterface,
    @Inject(PROVIDER_APPROVE_USE_CASE_PROVIDE)
    private readonly approveUseCase: ApproveProviderUseCaseInterface,
    @Inject(PROVIDER_REJECT_USE_CASE_PROVIDE)
    private readonly rejectUseCase: RejectProviderUseCaseInterface,
    @Inject(PROVIDER_LIST_PENDING_USE_CASE_PROVIDE)
    private readonly listPendingUseCase: ListPendingProvidersUseCaseInterface,
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
  ) {}

  create(params: CreateProviderUseCaseParams): Promise<ProviderProfile> {
    return this.createUseCase.execute(params);
  }

  findById(id: string): Promise<ProviderProfile> {
    return this.getByIdUseCase.execute({ id });
  }

  list(): Promise<ProviderProfile[]> {
    return this.listUseCase.execute();
  }

  update(params: UpdateProviderUseCaseParams): Promise<ProviderProfile> {
    return this.updateUseCase.execute(params);
  }

  addService(params: AddProviderServiceUseCaseParams): Promise<ProviderServiceEntity> {
    return this.addServiceUseCase.execute(params);
  }

  removeService(providerId: string, serviceId: string): Promise<void> {
    return this.removeServiceUseCase.execute({ providerId, serviceId });
  }

  listServices(providerId: string): Promise<ProviderServiceEntity[]> {
    return this.providerRepository.listServices(providerId);
  }

  addWorkLocation(params: AddWorkLocationUseCaseParams): Promise<ProviderWorkLocation> {
    return this.addWorkLocationUseCase.execute(params);
  }

  removeWorkLocation(providerId: string, locationId: string): Promise<void> {
    return this.removeWorkLocationUseCase.execute({ providerId, locationId });
  }

  listWorkLocations(providerId: string): Promise<ProviderWorkLocation[]> {
    return this.providerRepository.listWorkLocations(providerId);
  }

  submitVerification(providerId: string): Promise<ProviderVerification> {
    return this.submitVerificationUseCase.execute({ providerId });
  }

  getVerification(providerId: string): Promise<ProviderVerification> {
    return this.getVerificationUseCase.execute({ providerId });
  }

  approve(params: ApproveProviderUseCaseParams): Promise<ProviderVerification> {
    return this.approveUseCase.execute(params);
  }

  reject(params: RejectProviderUseCaseParams): Promise<ProviderVerification> {
    return this.rejectUseCase.execute(params);
  }

  listPending(): Promise<ProviderProfile[]> {
    return this.listPendingUseCase.execute();
  }
}
