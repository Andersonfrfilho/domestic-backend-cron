import { Inject, Injectable } from '@nestjs/common';

import { type UserRepositoryInterface } from '../../user.repository.interface';
import { USER_REPOSITORY_PROVIDE } from '../../user.token';

import {
  GetUserStatsUseCaseInterface,
  GetUserStatsUseCaseResponse,
} from './get-user-stats.interface';

@Injectable()
export class GetUserStatsUseCase implements GetUserStatsUseCaseInterface {
  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(): Promise<GetUserStatsUseCaseResponse> {
    return this.userRepository.getStats();
  }
}
