import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Address } from '@app/modules/shared/providers/database/entities/address.entity';
import { UserAddress } from '@app/modules/shared/providers/database/entities/user-address.entity';
import { User } from '@app/modules/shared/providers/database/entities/user.entity';
import { AddressRepository } from '@app/modules/shared/providers/database/repositories/address.repository';
import { SharedModule } from '@modules/shared/shared.module';

import { CONNECTIONS_NAMES } from '../shared/providers/database/database.constant';

import { UserAddressRepository } from './repositories/user-address.repository';
import { AddUserAddressUseCase } from './use-cases/add-user-address/add-user-address.use-case';
import { UserApplicationCreateUseCase } from './use-cases/create-users/create-user.use-case';
import { DeleteUserUseCase } from './use-cases/delete-user/delete-user.use-case';
import { GetUserByIdUseCase } from './use-cases/get-user-by-id/get-user-by-id.use-case';
import { GetUserByKeycloakIdUseCase } from './use-cases/get-user-by-keycloak-id/get-user-by-keycloak-id.use-case';
import { GetUserStatsUseCase } from './use-cases/get-user-stats/get-user-stats.use-case';
import { ListUserAddressesUseCase } from './use-cases/list-user-addresses/list-user-addresses.use-case';
import { RemoveUserAddressUseCase } from './use-cases/remove-user-address/remove-user-address.use-case';
import { UpdateUserUseCase } from './use-cases/update-user/update-user.use-case';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import {
  ADD_USER_ADDRESS_USE_CASE_PROVIDE,
  ADDRESS_REPOSITORY_PROVIDE,
  LIST_USER_ADDRESSES_USE_CASE_PROVIDE,
  REMOVE_USER_ADDRESS_USE_CASE_PROVIDE,
  USER_ADDRESS_REPOSITORY_PROVIDE,
  USER_CREATE_USE_CASE_PROVIDE,
  USER_DELETE_USE_CASE_PROVIDE,
  USER_GET_BY_ID_USE_CASE_PROVIDE,
  USER_GET_BY_KEYCLOAK_ID_USE_CASE_PROVIDE,
  USER_GET_STATS_USE_CASE_PROVIDE,
  USER_REPOSITORY_PROVIDE,
  USER_SERVICE_PROVIDE,
  USER_UPDATE_USE_CASE_PROVIDE,
} from './user.token';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Address, UserAddress], CONNECTIONS_NAMES.POSTGRES),
    SharedModule,
  ],
  controllers: [UserController],
  providers: [
    { provide: USER_REPOSITORY_PROVIDE, useClass: UserRepository },
    { provide: ADDRESS_REPOSITORY_PROVIDE, useClass: AddressRepository },
    { provide: USER_ADDRESS_REPOSITORY_PROVIDE, useClass: UserAddressRepository },
    { provide: USER_CREATE_USE_CASE_PROVIDE, useClass: UserApplicationCreateUseCase },
    { provide: USER_GET_BY_ID_USE_CASE_PROVIDE, useClass: GetUserByIdUseCase },
    { provide: USER_GET_BY_KEYCLOAK_ID_USE_CASE_PROVIDE, useClass: GetUserByKeycloakIdUseCase },
    { provide: USER_UPDATE_USE_CASE_PROVIDE, useClass: UpdateUserUseCase },
    { provide: USER_DELETE_USE_CASE_PROVIDE, useClass: DeleteUserUseCase },
    { provide: USER_GET_STATS_USE_CASE_PROVIDE, useClass: GetUserStatsUseCase },
    { provide: ADD_USER_ADDRESS_USE_CASE_PROVIDE, useClass: AddUserAddressUseCase },
    { provide: REMOVE_USER_ADDRESS_USE_CASE_PROVIDE, useClass: RemoveUserAddressUseCase },
    { provide: LIST_USER_ADDRESSES_USE_CASE_PROVIDE, useClass: ListUserAddressesUseCase },
    { provide: USER_SERVICE_PROVIDE, useClass: UserService },
  ],
  exports: [USER_REPOSITORY_PROVIDE, USER_SERVICE_PROVIDE],
})
export class UserModule {}
