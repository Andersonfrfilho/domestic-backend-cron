export interface ProviderApprovalEvent {
  provider_id: string;
  user_id: string;
  email: string;
  fcm_token?: string;
  reason?: string; // somente em provider.rejected
}
