export interface SendPushParams {
  fcmToken: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface FirebaseProviderInterface {
  sendPush(params: SendPushParams): Promise<void>;
}
