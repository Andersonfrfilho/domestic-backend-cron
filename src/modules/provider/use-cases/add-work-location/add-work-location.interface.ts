import { ProviderWorkLocation } from '@modules/shared/providers/database/entities/provider-work-location.entity';

export interface AddWorkLocationUseCaseParams {
  providerId: string;
  addressId: string;
  name?: string;
  isPrimary?: boolean;
}

export type AddWorkLocationUseCaseResponse = ProviderWorkLocation;

export interface AddWorkLocationUseCaseInterface {
  execute(params: AddWorkLocationUseCaseParams): Promise<AddWorkLocationUseCaseResponse>;
}
