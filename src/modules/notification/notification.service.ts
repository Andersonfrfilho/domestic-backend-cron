import { Inject, Injectable } from '@nestjs/common';

import { Notification } from '@modules/shared/providers/database/entities/notification.entity';

import { type ListNotificationsUseCaseInterface } from './use-cases/list-notifications/list-notifications.interface';
import { type MarkNotificationReadUseCaseInterface } from './use-cases/mark-notification-read/mark-notification-read.interface';
import { NOTIFICATION_LIST_USE_CASE_PROVIDE, NOTIFICATION_MARK_READ_USE_CASE_PROVIDE } from './notification.token';

export interface NotificationServiceInterface {
  list(userId: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
}

@Injectable()
export class NotificationService implements NotificationServiceInterface {
  constructor(
    @Inject(NOTIFICATION_LIST_USE_CASE_PROVIDE)
    private readonly listUseCase: ListNotificationsUseCaseInterface,
    @Inject(NOTIFICATION_MARK_READ_USE_CASE_PROVIDE)
    private readonly markReadUseCase: MarkNotificationReadUseCaseInterface,
  ) {}

  list(userId: string): Promise<Notification[]> {
    return this.listUseCase.execute({ userId });
  }

  markAsRead(id: string): Promise<void> {
    return this.markReadUseCase.execute({ id });
  }
}
