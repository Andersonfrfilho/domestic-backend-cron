import { ProviderVerification } from '@modules/shared/providers/database/entities/provider-verification.entity';

export interface ApproveProviderUseCaseParams {
  providerId: string;
  reviewedBy: string;
  notes?: string;
}

export type ApproveProviderUseCaseResponse = ProviderVerification;

export interface ApproveProviderUseCaseInterface {
  execute(params: ApproveProviderUseCaseParams): Promise<ApproveProviderUseCaseResponse>;
}
