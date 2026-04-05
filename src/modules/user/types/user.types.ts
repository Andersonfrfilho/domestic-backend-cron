import { User } from '@app/modules/shared/providers/database/entities/user.entity';

export interface CreateUserParams extends Pick<User, 'fullName'> {
  keycloakId?: string;
  status?: string;
}

export interface UpdateUserParams {
  fullName?: string;
  status?: string;
}
