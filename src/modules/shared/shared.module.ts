import { Module } from '@nestjs/common';

import { SharedProviderModule } from './providers/provider.module';
import { CronRabbitMQModule } from './rabbitmq/rabbitmq.module';
import { CronLockModule } from './lock/cron-lock.module';

@Module({
  imports: [SharedProviderModule, CronRabbitMQModule, CronLockModule],
  exports: [SharedProviderModule, CronRabbitMQModule, CronLockModule],
})
export class SharedModule {}
