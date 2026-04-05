import { User } from '@app/modules/shared/providers/database/entities/user.entity';

export interface GetUserByKeycloakIdUseCaseParams {
  keycloakId: string;
}

export interface GetUserByKeycloakIdUseCaseResponse extends User {}

export interface GetUserByKeycloakIdUseCaseInterface {
  execute(params: GetUserByKeycloakIdUseCaseParams): Promise<GetUserByKeycloakIdUseCaseResponse>;
}
