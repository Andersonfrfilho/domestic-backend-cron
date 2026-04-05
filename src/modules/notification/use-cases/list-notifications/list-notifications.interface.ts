import { Notification } from '@modules/shared/providers/database/entities/notification.entity';

export interface ListNotificationsUseCaseParams {
  userId: string;
}

export type ListNotificationsUseCaseResponse = Notification[];

export interface ListNotificationsUseCaseInterface {
  execute(params: ListNotificationsUseCaseParams): Promise<ListNotificationsUseCaseResponse>;
}
