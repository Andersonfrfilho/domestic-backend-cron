import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';
import { ProviderService as ProviderServiceEntity } from '@modules/shared/providers/database/entities/provider-service.entity';
import { ProviderVerification } from '@modules/shared/providers/database/entities/provider-verification.entity';
import { ProviderWorkLocation } from '@modules/shared/providers/database/entities/provider-work-location.entity';
import { SharedModule } from '@modules/shared/shared.module';

import { CONNECTIONS_NAMES } from '../shared/providers/database/database.constant';

import { ProviderController } from './provider.controller';
import { ProviderRepository } from './provider.repository';
import { ProviderService } from './provider.service';

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
  PROVIDER_REPOSITORY_PROVIDE,
  PROVIDER_SERVICE_PROVIDE,
  PROVIDER_SUBMIT_VERIFICATION_USE_CASE_PROVIDE,
  PROVIDER_UPDATE_USE_CASE_PROVIDE,
} from './provider.token';

import { CreateProviderUseCase } from './use-cases/create-provider/create-provider.use-case';
import { GetProviderByIdUseCase } from './use-cases/get-provider-by-id/get-provider-by-id.use-case';
import { ListProvidersUseCase } from './use-cases/list-providers/list-providers.use-case';
import { UpdateProviderUseCase } from './use-cases/update-provider/update-provider.use-case';
import { AddProviderServiceUseCase } from './use-cases/add-provider-service/add-provider-service.use-case';
import { RemoveProviderServiceUseCase } from './use-cases/remove-provider-service/remove-provider-service.use-case';
import { AddWorkLocationUseCase } from './use-cases/add-work-location/add-work-location.use-case';
import { RemoveWorkLocationUseCase } from './use-cases/remove-work-location/remove-work-location.use-case';
import { SubmitVerificationUseCase } from './use-cases/submit-verification/submit-verification.use-case';
import { GetProviderVerificationUseCase } from './use-cases/get-provider-verification/get-provider-verification.use-case';
import { ApproveProviderUseCase } from './use-cases/approve-provider/approve-provider.use-case';
import { RejectProviderUseCase } from './use-cases/reject-provider/reject-provider.use-case';
import { ListPendingProvidersUseCase } from './use-cases/list-pending-providers/list-pending-providers.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [ProviderProfile, ProviderServiceEntity, ProviderVerification, ProviderWorkLocation],
      CONNECTIONS_NAMES.POSTGRES,
    ),
    SharedModule,
  ],
  controllers: [ProviderController],
  providers: [
    { provide: PROVIDER_REPOSITORY_PROVIDE, useClass: ProviderRepository },
    { provide: PROVIDER_CREATE_USE_CASE_PROVIDE, useClass: CreateProviderUseCase },
    { provide: PROVIDER_GET_BY_ID_USE_CASE_PROVIDE, useClass: GetProviderByIdUseCase },
    { provide: PROVIDER_LIST_USE_CASE_PROVIDE, useClass: ListProvidersUseCase },
    { provide: PROVIDER_UPDATE_USE_CASE_PROVIDE, useClass: UpdateProviderUseCase },
    { provide: PROVIDER_ADD_SERVICE_USE_CASE_PROVIDE, useClass: AddProviderServiceUseCase },
    { provide: PROVIDER_REMOVE_SERVICE_USE_CASE_PROVIDE, useClass: RemoveProviderServiceUseCase },
    { provide: PROVIDER_ADD_WORK_LOCATION_USE_CASE_PROVIDE, useClass: AddWorkLocationUseCase },
    { provide: PROVIDER_REMOVE_WORK_LOCATION_USE_CASE_PROVIDE, useClass: RemoveWorkLocationUseCase },
    { provide: PROVIDER_SUBMIT_VERIFICATION_USE_CASE_PROVIDE, useClass: SubmitVerificationUseCase },
    { provide: PROVIDER_GET_VERIFICATION_USE_CASE_PROVIDE, useClass: GetProviderVerificationUseCase },
    { provide: PROVIDER_APPROVE_USE_CASE_PROVIDE, useClass: ApproveProviderUseCase },
    { provide: PROVIDER_REJECT_USE_CASE_PROVIDE, useClass: RejectProviderUseCase },
    { provide: PROVIDER_LIST_PENDING_USE_CASE_PROVIDE, useClass: ListPendingProvidersUseCase },
    { provide: PROVIDER_SERVICE_PROVIDE, useClass: ProviderService },
  ],
  exports: [PROVIDER_REPOSITORY_PROVIDE, PROVIDER_SERVICE_PROVIDE],
})
export class ProviderModule {}
