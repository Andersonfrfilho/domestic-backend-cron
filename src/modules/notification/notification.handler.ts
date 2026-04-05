import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';

import { Notification } from '@modules/shared/providers/database/entities/notification.entity';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';

import type { NotificationPersistEvent } from './dtos/notification-persist.event.dto';

@Injectable()
export class NotificationHandler {
  private readonly logger = new Logger(NotificationHandler.name);

  constructor(
    @InjectRepository(Notification, CONNECTIONS_NAMES.MONGO)
    private readonly notificationRepo: MongoRepository<Notification>,
  ) {}

  async persist(event: NotificationPersistEvent): Promise<void> {
    const notification = this.notificationRepo.create({
      userId: event.user_id,
      message: event.message,
      type: event.metadata.event_type,
      read: false,
    } as any);

    await this.notificationRepo.save(notification);
    this.logger.log(`Notification persisted for user: ${event.user_id} — type: ${event.metadata.event_type}`);
  }
}
