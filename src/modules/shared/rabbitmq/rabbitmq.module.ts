import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';

// Cron usa RabbitMQ somente como producer (para publicar lembretes)
@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
        exchanges: [
          { name: 'zolve.events', type: 'topic', options: { durable: true } },
        ],
        connectionInitOptions: { wait: false },
      }),
    }),
  ],
  exports: [RabbitMQModule],
})
export class CronRabbitMQModule {}
