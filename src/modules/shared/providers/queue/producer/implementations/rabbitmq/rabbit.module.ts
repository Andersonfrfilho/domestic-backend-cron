import { LoggerModule } from '@adatechnology/logger';
import { Module } from '@nestjs/common';

import { QUEUE_PRODUCER_PROVIDER } from '../../producer.token';
import { CronRabbitMQModule } from '@modules/shared/rabbitmq/rabbitmq.module';

import { RabbitBindingsService } from './rabbit.bindings.service';
import { RabbitMQMessageProducer } from './rabbit.provider';

@Module({
  imports: [LoggerModule, CronRabbitMQModule],
  providers: [
    {
      provide: QUEUE_PRODUCER_PROVIDER,
      useClass: RabbitMQMessageProducer,
    },
    RabbitBindingsService,
  ],
  exports: [QUEUE_PRODUCER_PROVIDER],
})
export class SharedInfrastructureProviderQueueProducerImplementationsRabbitMqModule {}
