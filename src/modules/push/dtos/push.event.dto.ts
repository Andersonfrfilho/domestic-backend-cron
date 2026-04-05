export interface PushEvent {
  user_id: string;
  fcm_token?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}
