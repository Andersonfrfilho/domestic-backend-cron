import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CronRabbitMQModule } from '@modules/shared/rabbitmq/rabbitmq.module';
import { ServiceRequest } from '@modules/shared/providers/database/entities/service-request.entity';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';

import { RequestReminderService } from './request-reminder.service';
import { RequestReminderJob } from './request-reminder.job';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRequest], CONNECTIONS_NAMES.POSTGRES), CronRabbitMQModule],
  providers: [RequestReminderService, RequestReminderJob],
  exports: [RequestReminderService],
})
export class RequestReminderModule {}
