export interface MarkNotificationReadUseCaseParams {
  id: string;
}

export interface MarkNotificationReadUseCaseInterface {
  execute(params: MarkNotificationReadUseCaseParams): Promise<void>;
}
