import { ProviderService } from '@modules/shared/providers/database/entities/provider-service.entity';

export interface AddProviderServiceUseCaseParams {
  providerId: string;
  serviceId: string;
  priceBase?: number;
  priceType?: string;
}

export type AddProviderServiceUseCaseResponse = ProviderService;

export interface AddProviderServiceUseCaseInterface {
  execute(params: AddProviderServiceUseCaseParams): Promise<AddProviderServiceUseCaseResponse>;
}
