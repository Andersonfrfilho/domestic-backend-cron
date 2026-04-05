import { User } from '@app/modules/shared/providers/database/entities/user.entity';

export interface GetUserByIdUseCaseParams {
  id: string;
}

export interface GetUserByIdUseCaseResponse extends User {}

export interface GetUserByIdUseCaseInterface {
  execute(params: GetUserByIdUseCaseParams): Promise<GetUserByIdUseCaseResponse>;
}
