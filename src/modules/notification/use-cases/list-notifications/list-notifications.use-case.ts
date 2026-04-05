import { Inject, Injectable } from '@nestjs/common';

import { type NotificationRepositoryInterface } from '../../notification.repository.interface';
import { NOTIFICATION_REPOSITORY_PROVIDE } from '../../notification.token';

import {
  ListNotificationsUseCaseInterface,
  ListNotificationsUseCaseParams,
  ListNotificationsUseCaseResponse,
} from './list-notifications.interface';

@Injectable()
export class ListNotificationsUseCase implements ListNotificationsUseCaseInterface {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY_PROVIDE)
    private readonly notificationRepository: NotificationRepositoryInterface,
  ) {}

  async execute(params: ListNotificationsUseCaseParams): Promise<ListNotificationsUseCaseResponse> {
    return this.notificationRepository.listByUser(params.userId);
  }
}
