import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, ObjectId } from 'typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { Notification } from '@modules/shared/providers/database/entities/notification.entity';

import { NotificationRepositoryInterface } from './notification.repository.interface';

@Injectable()
export class NotificationRepository implements NotificationRepositoryInterface {
  constructor(
    @InjectRepository(Notification, CONNECTIONS_NAMES.MONGO)
    private readonly repo: MongoRepository<Notification>,
  ) {}

  async listByUser(userId: string): Promise<Notification[]> {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } } as any);
  }

  async markAsRead(id: ObjectId): Promise<void> {
    await this.repo.update({ _id: id } as any, { read: true });
  }
}
