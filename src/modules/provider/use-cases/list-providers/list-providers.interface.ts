import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';

export type ListProvidersUseCaseResponse = ProviderProfile[];

export interface ListProvidersUseCaseInterface {
  execute(): Promise<ListProvidersUseCaseResponse>;
}
