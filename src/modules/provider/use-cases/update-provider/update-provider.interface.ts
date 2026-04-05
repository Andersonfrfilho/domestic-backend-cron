import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';

export interface UpdateProviderUseCaseParams {
  id: string;
  businessName?: string;
  description?: string;
  isAvailable?: boolean;
}

export type UpdateProviderUseCaseResponse = ProviderProfile;

export interface UpdateProviderUseCaseInterface {
  execute(params: UpdateProviderUseCaseParams): Promise<UpdateProviderUseCaseResponse>;
}
