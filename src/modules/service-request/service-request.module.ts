import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServiceRequest } from '@modules/shared/providers/database/entities/service-request.entity';
import { SharedModule } from '@modules/shared/shared.module';
import { UserModule } from '@modules/user/user.module';
import { ProviderModule } from '@modules/provider/provider.module';

import { CONNECTIONS_NAMES } from '../shared/providers/database/database.constant';

import { ServiceRequestController } from './service-request.controller';
import { ServiceRequestRepository } from './service-request.repository';
import { ServiceRequestService } from './service-request.service';

import {
  SERVICE_REQUEST_ACCEPT_USE_CASE_PROVIDE,
  SERVICE_REQUEST_CANCEL_USE_CASE_PROVIDE,
  SERVICE_REQUEST_COMPLETE_USE_CASE_PROVIDE,
  SERVICE_REQUEST_CREATE_USE_CASE_PROVIDE,
  SERVICE_REQUEST_GET_BY_ID_USE_CASE_PROVIDE,
  SERVICE_REQUEST_LIST_BY_PROVIDER_USE_CASE_PROVIDE,
  SERVICE_REQUEST_LIST_BY_USER_USE_CASE_PROVIDE,
  SERVICE_REQUEST_REJECT_USE_CASE_PROVIDE,
  SERVICE_REQUEST_REPOSITORY_PROVIDE,
  SERVICE_REQUEST_SERVICE_PROVIDE,
} from './service-request.token';

import { CreateServiceRequestUseCase } from './use-cases/create-service-request/create-service-request.use-case';
import { GetServiceRequestByIdUseCase } from './use-cases/get-service-request-by-id/get-service-request-by-id.use-case';
import { ListServiceRequestsByUserUseCase } from './use-cases/list-service-requests-by-user/list-service-requests-by-user.use-case';
import { ListServiceRequestsByProviderUseCase } from './use-cases/list-service-requests-by-provider/list-service-requests-by-provider.use-case';
import { AcceptServiceRequestUseCase } from './use-cases/accept-service-request/accept-service-request.use-case';
import { RejectServiceRequestUseCase } from './use-cases/reject-service-request/reject-service-request.use-case';
import { CompleteServiceRequestUseCase } from './use-cases/complete-service-request/complete-service-request.use-case';
import { CancelServiceRequestUseCase } from './use-cases/cancel-service-request/cancel-service-request.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceRequest], CONNECTIONS_NAMES.POSTGRES),
    SharedModule,
    UserModule,
    ProviderModule,
  ],
  controllers: [ServiceRequestController],
  providers: [
    { provide: SERVICE_REQUEST_REPOSITORY_PROVIDE, useClass: ServiceRequestRepository },
    { provide: SERVICE_REQUEST_CREATE_USE_CASE_PROVIDE, useClass: CreateServiceRequestUseCase },
    { provide: SERVICE_REQUEST_GET_BY_ID_USE_CASE_PROVIDE, useClass: GetServiceRequestByIdUseCase },
    { provide: SERVICE_REQUEST_LIST_BY_USER_USE_CASE_PROVIDE, useClass: ListServiceRequestsByUserUseCase },
    { provide: SERVICE_REQUEST_LIST_BY_PROVIDER_USE_CASE_PROVIDE, useClass: ListServiceRequestsByProviderUseCase },
    { provide: SERVICE_REQUEST_ACCEPT_USE_CASE_PROVIDE, useClass: AcceptServiceRequestUseCase },
    { provide: SERVICE_REQUEST_REJECT_USE_CASE_PROVIDE, useClass: RejectServiceRequestUseCase },
    { provide: SERVICE_REQUEST_COMPLETE_USE_CASE_PROVIDE, useClass: CompleteServiceRequestUseCase },
    { provide: SERVICE_REQUEST_CANCEL_USE_CASE_PROVIDE, useClass: CancelServiceRequestUseCase },
    { provide: SERVICE_REQUEST_SERVICE_PROVIDE, useClass: ServiceRequestService },
  ],
  exports: [SERVICE_REQUEST_REPOSITORY_PROVIDE, SERVICE_REQUEST_SERVICE_PROVIDE],
})
export class ServiceRequestModule {}
