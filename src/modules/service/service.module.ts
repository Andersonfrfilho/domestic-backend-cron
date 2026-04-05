import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Service } from '@app/modules/shared/providers/database/entities/service.entity';
import { SharedModule } from '@modules/shared/shared.module';
import { CategoryModule } from '@modules/category/category.module';

import { CONNECTIONS_NAMES } from '../shared/providers/database/database.constant';

import { ServiceController } from './service.controller';
import { ServiceRepository } from './service.repository';
import { ServiceService } from './service.service';
import {
  SERVICE_CREATE_USE_CASE_PROVIDE,
  SERVICE_GET_BY_ID_USE_CASE_PROVIDE,
  SERVICE_LIST_USE_CASE_PROVIDE,
  SERVICE_REPOSITORY_PROVIDE,
  SERVICE_SERVICE_PROVIDE,
  SERVICE_UPDATE_USE_CASE_PROVIDE,
} from './service.token';
import { CreateServiceUseCase } from './use-cases/create-service/create-service.use-case';
import { GetServiceByIdUseCase } from './use-cases/get-service-by-id/get-service-by-id.use-case';
import { ListServicesUseCase } from './use-cases/list-services/list-services.use-case';
import { UpdateServiceUseCase } from './use-cases/update-service/update-service.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service], CONNECTIONS_NAMES.POSTGRES),
    SharedModule,
    CategoryModule,
  ],
  controllers: [ServiceController],
  providers: [
    { provide: SERVICE_REPOSITORY_PROVIDE, useClass: ServiceRepository },
    { provide: SERVICE_CREATE_USE_CASE_PROVIDE, useClass: CreateServiceUseCase },
    { provide: SERVICE_UPDATE_USE_CASE_PROVIDE, useClass: UpdateServiceUseCase },
    { provide: SERVICE_LIST_USE_CASE_PROVIDE, useClass: ListServicesUseCase },
    { provide: SERVICE_GET_BY_ID_USE_CASE_PROVIDE, useClass: GetServiceByIdUseCase },
    { provide: SERVICE_SERVICE_PROVIDE, useClass: ServiceService },
  ],
  exports: [SERVICE_REPOSITORY_PROVIDE, SERVICE_SERVICE_PROVIDE],
})
export class ServiceModule {}
