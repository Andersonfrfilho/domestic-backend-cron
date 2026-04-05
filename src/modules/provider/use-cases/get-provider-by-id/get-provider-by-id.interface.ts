import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';

export interface GetProviderByIdUseCaseParams {
  id: string;
}

export type GetProviderByIdUseCaseResponse = ProviderProfile;

export interface GetProviderByIdUseCaseInterface {
  execute(params: GetProviderByIdUseCaseParams): Promise<GetProviderByIdUseCaseResponse>;
}
