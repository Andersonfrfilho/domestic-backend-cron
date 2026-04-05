import { Inject, Injectable } from '@nestjs/common';

import { UserErrorFactory } from '@modules/user/factories';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';

import { type UserRepositoryInterface } from '../../user.repository.interface';
import {
  UpdateUserUseCaseInterface,
  UpdateUserUseCaseParams,
  UpdateUserUseCaseResponse,
} from './update-user.interface';

@Injectable()
export class UpdateUserUseCase implements UpdateUserUseCaseInterface {
  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(params: UpdateUserUseCaseParams): Promise<UpdateUserUseCaseResponse> {
    const user = await this.userRepository.findById(params.id);
    if (!user) {
      throw UserErrorFactory.notFound(params.id);
    }

    return this.userRepository.update(params.id, {
      fullName: params.fullName,
      status: params.status,
    });
  }
}
