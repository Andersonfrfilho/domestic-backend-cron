import { Inject, Injectable } from '@nestjs/common';

import { type AddressRepositoryInterface } from '@modules/shared/providers/database/repositories/address.repository.interface';
import { UserErrorFactory } from '@modules/user/factories';
import {
  ADDRESS_REPOSITORY_PROVIDE,
  USER_ADDRESS_REPOSITORY_PROVIDE,
  USER_REPOSITORY_PROVIDE,
} from '@modules/user/user.token';

import { type UserRepositoryInterface } from '../../user.repository.interface';
import { type UserAddressRepositoryInterface } from '../../user-address.repository.interface';
import {
  AddUserAddressUseCaseInterface,
  AddUserAddressUseCaseParams,
  AddUserAddressUseCaseResponse,
} from './add-user-address.interface';

@Injectable()
export class AddUserAddressUseCase implements AddUserAddressUseCaseInterface {
  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(ADDRESS_REPOSITORY_PROVIDE)
    private readonly addressRepository: AddressRepositoryInterface,
    @Inject(USER_ADDRESS_REPOSITORY_PROVIDE)
    private readonly userAddressRepository: UserAddressRepositoryInterface,
  ) {}

  async execute(params: AddUserAddressUseCaseParams): Promise<AddUserAddressUseCaseResponse> {
    const user = await this.userRepository.findById(params.userId);
    if (!user) throw UserErrorFactory.notFound(params.userId);

    const address = await this.addressRepository.createAddress({
      street: params.street,
      number: params.number,
      complement: params.complement ?? null,
      neighborhood: params.neighborhood,
      city: params.city,
      state: params.state,
      zipCode: params.zipCode,
      latitude: params.latitude ?? null,
      longitude: params.longitude ?? null,
      isVerified: false,
    });

    return this.userAddressRepository.linkUserToAddress(
      params.userId,
      address.id,
      params.label,
      params.isPrimary ?? false,
    );
  }
}
