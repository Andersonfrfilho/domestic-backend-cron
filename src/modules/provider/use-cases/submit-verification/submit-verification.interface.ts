import { ProviderVerification } from '@modules/shared/providers/database/entities/provider-verification.entity';

export interface SubmitVerificationUseCaseParams {
  providerId: string;
}

export type SubmitVerificationUseCaseResponse = ProviderVerification;

export interface SubmitVerificationUseCaseInterface {
  execute(params: SubmitVerificationUseCaseParams): Promise<SubmitVerificationUseCaseResponse>;
}
