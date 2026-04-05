import { ObjectId } from 'typeorm';

import { Notification } from '@modules/shared/providers/database/entities/notification.entity';

export interface NotificationRepositoryInterface {
  listByUser(userId: string): Promise<Notification[]>;
  markAsRead(id: ObjectId): Promise<void>;
}
