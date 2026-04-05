export type ServiceRequestEventType = 'created' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface ServiceRequestEvent {
  event_type: ServiceRequestEventType;
  request_id: string;
  provider_id: string;
  provider_user_id: string;
  provider_email: string;
  provider_fcm_token?: string;
  contractor_id: string;
  contractor_user_id: string;
  contractor_email: string;
  contractor_fcm_token?: string;
  service_name: string;
  scheduled_at?: string;
}
