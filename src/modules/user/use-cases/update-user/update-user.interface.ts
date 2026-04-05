import { User } from '@app/modules/shared/providers/database/entities/user.entity';

export interface UpdateUserUseCaseParams {
  id: string;
  fullName?: string;
  status?: string;
}

export interface UpdateUserUseCaseResponse extends User {}

export interface UpdateUserUseCaseInterface {
  execute(params: UpdateUserUseCaseParams): Promise<UpdateUserUseCaseResponse>;
}
