import { Inject, Injectable } from '@nestjs/common';

import { UserAddressErrorFactory } from '@modules/user/factories/user-address.error.factory';
import { USER_ADDRESS_REPOSITORY_PROVIDE } from '@modules/user/user.token';

import { type UserAddressRepositoryInterface } from '../../user-address.repository.interface';
import {
  RemoveUserAddressUseCaseInterface,
  RemoveUserAddressUseCaseParams,
} from './remove-user-address.interface';

@Injectable()
export class RemoveUserAddressUseCase implements RemoveUserAddressUseCaseInterface {
  constructor(
    @Inject(USER_ADDRESS_REPOSITORY_PROVIDE)
    private readonly userAddressRepository: UserAddressRepositoryInterface,
  ) {}

  async execute(params: RemoveUserAddressUseCaseParams): Promise<void> {
    const userAddress = await this.userAddressRepository.findById(params.userAddressId);
    if (!userAddress || userAddress.userId !== params.userId) {
      throw UserAddressErrorFactory.notFound(params.userAddressId);
    }

    await this.userAddressRepository.delete(params.userAddressId);
  }
}
