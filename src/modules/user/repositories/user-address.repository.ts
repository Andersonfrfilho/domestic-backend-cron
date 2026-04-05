import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { UserAddress } from '@modules/shared/providers/database/entities/user-address.entity';

import { UserAddressErrorFactory } from '../factories/user-address.error.factory';
import {
  CreateUserAddressParams,
  UpdateUserAddressParams,
  UserAddressRepositoryInterface,
} from '../user-address.repository.interface';

@Injectable()
export class UserAddressRepository implements UserAddressRepositoryInterface {
  constructor(
    @InjectRepository(UserAddress, CONNECTIONS_NAMES.POSTGRES)
    private typeormRepo: Repository<UserAddress>,
  ) {}

  async create(userAddress: CreateUserAddressParams): Promise<UserAddress> {
    const newUserAddress = this.typeormRepo.create(userAddress);
    return this.typeormRepo.save(newUserAddress);
  }

  async findById(id: string): Promise<UserAddress | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: ['user', 'address'],
    });
  }

  async findByUserId(userId: string): Promise<UserAddress[]> {
    return this.typeormRepo.find({
      where: { userId },
      relations: ['address'],
    });
  }

  async findByAddressId(addressId: string): Promise<UserAddress[]> {
    return this.typeormRepo.find({
      where: { addressId },
      relations: ['user'],
    });
  }

  async findPrimaryByUserId(userId: string): Promise<UserAddress | null> {
    return this.typeormRepo.findOne({
      where: { userId, isPrimary: true },
      relations: ['address'],
    });
  }

  async update(id: string, userAddress: UpdateUserAddressParams): Promise<UserAddress> {
    await this.typeormRepo.update(id, userAddress);
    const updated = await this.typeormRepo.findOne({
      where: { id },
      relations: ['user', 'address'],
    });
    if (!updated) {
      throw UserAddressErrorFactory.notFound(id);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.typeormRepo.delete(id);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.typeormRepo.delete({ userId });
  }

  async linkUserToAddress(
    userId: string,
    addressId: string,
    label?: string,
    isPrimary: boolean = false,
  ): Promise<UserAddress> {
    return this.create({
      userId,
      addressId,
      label,
      isPrimary,
    });
  }

  async unlinkUserFromAddress(userId: string, addressId: string): Promise<void> {
    await this.typeormRepo.delete({ userId, addressId });
  }
}
