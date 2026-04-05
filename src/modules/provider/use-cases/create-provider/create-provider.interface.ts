import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';

export interface CreateProviderUseCaseParams {
  userId: string;
  businessName?: string;
  description?: string;
}

export type CreateProviderUseCaseResponse = ProviderProfile;

export interface CreateProviderUseCaseInterface {
  execute(params: CreateProviderUseCaseParams): Promise<CreateProviderUseCaseResponse>;
}
