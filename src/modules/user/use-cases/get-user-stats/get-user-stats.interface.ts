import { UserStats } from '../../user.repository.interface';

export interface GetUserStatsUseCaseResponse extends UserStats {}

export interface GetUserStatsUseCaseInterface {
  execute(): Promise<GetUserStatsUseCaseResponse>;
}
