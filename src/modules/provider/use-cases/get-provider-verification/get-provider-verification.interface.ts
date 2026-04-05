import { ProviderVerification } from '@modules/shared/providers/database/entities/provider-verification.entity';

export interface GetProviderVerificationUseCaseParams {
  providerId: string;
}

export type GetProviderVerificationUseCaseResponse = ProviderVerification;

export interface GetProviderVerificationUseCaseInterface {
  execute(params: GetProviderVerificationUseCaseParams): Promise<GetProviderVerificationUseCaseResponse>;
}
