import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Notification } from '@modules/shared/providers/database/entities/notification.entity';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';

import { NotificationHandler } from './notification.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Notification], CONNECTIONS_NAMES.MONGO)],
  providers: [NotificationHandler],
  exports: [NotificationHandler],
})
export class NotificationModule {}
