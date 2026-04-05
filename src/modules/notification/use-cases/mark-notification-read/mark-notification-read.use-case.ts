import { Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'typeorm';

import { type NotificationRepositoryInterface } from '../../notification.repository.interface';
import { NOTIFICATION_REPOSITORY_PROVIDE } from '../../notification.token';

import {
  MarkNotificationReadUseCaseInterface,
  MarkNotificationReadUseCaseParams,
} from './mark-notification-read.interface';

@Injectable()
export class MarkNotificationReadUseCase implements MarkNotificationReadUseCaseInterface {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY_PROVIDE)
    private readonly notificationRepository: NotificationRepositoryInterface,
  ) {}

  async execute(params: MarkNotificationReadUseCaseParams): Promise<void> {
    await this.notificationRepository.markAsRead(new ObjectId(params.id));
  }
}
