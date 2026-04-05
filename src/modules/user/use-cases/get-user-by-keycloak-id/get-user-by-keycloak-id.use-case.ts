import { Inject, Injectable } from '@nestjs/common';

import { UserErrorFactory } from '@modules/user/factories';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';

import { type UserRepositoryInterface } from '../../user.repository.interface';
import {
  GetUserByKeycloakIdUseCaseInterface,
  GetUserByKeycloakIdUseCaseParams,
  GetUserByKeycloakIdUseCaseResponse,
} from './get-user-by-keycloak-id.interface';

@Injectable()
export class GetUserByKeycloakIdUseCase implements GetUserByKeycloakIdUseCaseInterface {
  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(
    params: GetUserByKeycloakIdUseCaseParams,
  ): Promise<GetUserByKeycloakIdUseCaseResponse> {
    const user = await this.userRepository.findByKeycloakId(params.keycloakId);
    if (!user) {
      throw UserErrorFactory.notFound(params.keycloakId);
    }
    return user;
  }
}
