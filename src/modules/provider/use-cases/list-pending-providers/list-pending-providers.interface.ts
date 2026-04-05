import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';

export type ListPendingProvidersUseCaseResponse = ProviderProfile[];

export interface ListPendingProvidersUseCaseInterface {
  execute(): Promise<ListPendingProvidersUseCaseResponse>;
}
