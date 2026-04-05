import { ProviderVerification } from '@modules/shared/providers/database/entities/provider-verification.entity';

export interface RejectProviderUseCaseParams {
  providerId: string;
  reviewedBy: string;
  reason: string;
}

export type RejectProviderUseCaseResponse = ProviderVerification;

export interface RejectProviderUseCaseInterface {
  execute(params: RejectProviderUseCaseParams): Promise<RejectProviderUseCaseResponse>;
}
