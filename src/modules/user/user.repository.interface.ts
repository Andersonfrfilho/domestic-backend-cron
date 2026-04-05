import { User } from '@modules/shared/providers/database/entities/user.entity';

import { CreateUserParams, UpdateUserParams } from './types';

export interface UserStats {
  totalUsers: number;
  customers: number;
  providers: number;
}

export interface UserRepositoryInterface {
  create(user: CreateUserParams): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByKeycloakId(keycloakId: string): Promise<User | null>;
  update(id: string, user: UpdateUserParams): Promise<User>;
  delete(id: string): Promise<void>;
  getStats(): Promise<UserStats>;
}
