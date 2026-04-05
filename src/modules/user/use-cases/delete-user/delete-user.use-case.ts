import { Inject, Injectable } from '@nestjs/common';

import { UserErrorFactory } from '@modules/user/factories';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';

import { type UserRepositoryInterface } from '../../user.repository.interface';
import { DeleteUserUseCaseInterface, DeleteUserUseCaseParams } from './delete-user.interface';

@Injectable()
export class DeleteUserUseCase implements DeleteUserUseCaseInterface {
  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(params: DeleteUserUseCaseParams): Promise<void> {
    const user = await this.userRepository.findById(params.id);
    if (!user) {
      throw UserErrorFactory.notFound(params.id);
    }

    await this.userRepository.update(params.id, { status: 'DELETED' });
  }
}
