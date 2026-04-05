import { Inject, Injectable } from '@nestjs/common';

import { UserErrorFactory } from '@modules/user/factories';
import { USER_ADDRESS_REPOSITORY_PROVIDE, USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';

import { type UserRepositoryInterface } from '../../user.repository.interface';
import { type UserAddressRepositoryInterface } from '../../user-address.repository.interface';
import {
  ListUserAddressesUseCaseInterface,
  ListUserAddressesUseCaseParams,
  ListUserAddressesUseCaseResponse,
} from './list-user-addresses.interface';

@Injectable()
export class ListUserAddressesUseCase implements ListUserAddressesUseCaseInterface {
  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(USER_ADDRESS_REPOSITORY_PROVIDE)
    private readonly userAddressRepository: UserAddressRepositoryInterface,
  ) {}

  async execute(params: ListUserAddressesUseCaseParams): Promise<ListUserAddressesUseCaseResponse> {
    const user = await this.userRepository.findById(params.userId);
    if (!user) throw UserErrorFactory.notFound(params.userId);

    return this.userAddressRepository.findByUserId(params.userId);
  }
}
