export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export interface EmailProviderInterface {
  send(params: SendEmailParams): Promise<void>;
}
