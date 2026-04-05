import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { User } from '@modules/shared/providers/database/entities/user.entity';

import { UserErrorFactory } from './factories';
import { CreateUserParams, UpdateUserParams } from './types';
import { UserRepositoryInterface, UserStats } from './user.repository.interface';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    @InjectRepository(User, CONNECTIONS_NAMES.POSTGRES)
    private typeormRepo: Repository<User>,
  ) {}

  async create(user: CreateUserParams): Promise<User> {
    const newUser = this.typeormRepo.create(user);
    return this.typeormRepo.save(newUser);
  }

  async findById(id: string): Promise<User | null> {
    return this.typeormRepo.findOne({
      where: { id },
    });
  }

  async findByKeycloakId(keycloakId: string): Promise<User | null> {
    return this.typeormRepo.findOne({
      where: { keycloakId },
    });
  }

  async update(id: string, user: UpdateUserParams): Promise<User> {
    await this.typeormRepo.update(id, user);
    const updatedUser = await this.typeormRepo.findOne({
      where: { id },
    });
    if (!updatedUser) {
      throw UserErrorFactory.notFound(id);
    }
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    await this.typeormRepo.delete(id);
  }

  async getStats(): Promise<UserStats> {
    const totalUsers = await this.typeormRepo.count();

    const providers = await this.typeormRepo
      .createQueryBuilder('user')
      .innerJoin('provider_profiles', 'pp', 'pp.user_id = user.id')
      .getCount();

    const customers = totalUsers - providers;

    return {
      totalUsers,
      customers,
      providers,
    };
  }
}
