import { Inject, Injectable } from '@nestjs/common';

import { UserErrorFactory } from '@modules/user/factories';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';

import { type UserRepositoryInterface } from '../../user.repository.interface';
import {
  GetUserByIdUseCaseInterface,
  GetUserByIdUseCaseParams,
  GetUserByIdUseCaseResponse,
} from './get-user-by-id.interface';

@Injectable()
export class GetUserByIdUseCase implements GetUserByIdUseCaseInterface {
  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(params: GetUserByIdUseCaseParams): Promise<GetUserByIdUseCaseResponse> {
    const user = await this.userRepository.findById(params.id);
    if (!user) {
      throw UserErrorFactory.notFound(params.id);
    }
    return user;
  }
}
