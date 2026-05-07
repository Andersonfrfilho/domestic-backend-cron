import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Logger, Module } from '@nestjs/common';

const logger = new Logger('CronRabbitMQModule');

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      useFactory: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));

        const rabbitmqUrl = process.env.RABBITMQ_URL;
        const user = process.env.QUEUE_RABBITMQ_USER || 'guest';
        const pass = process.env.QUEUE_RABBITMQ_PASS || 'guest';
        const host = process.env.QUEUE_RABBITMQ_HOST || 'localhost';
        const port = process.env.QUEUE_RABBITMQ_PORT || '5672';

        const uri = rabbitmqUrl || `amqp://${user}:${pass}@${host}:${port}/`;

        console.log('🔍 CronRabbitMQModule URI:', uri);
        console.log('🔍 QUEUE_RABBITMQ_USER:', process.env.QUEUE_RABBITMQ_USER);
        console.log('🔍 QUEUE_RABBITMQ_HOST:', process.env.QUEUE_RABBITMQ_HOST);
        console.log('🔍 QUEUE_RABBITMQ_PORT:', process.env.QUEUE_RABBITMQ_PORT);

        if (uri.includes('guest') || uri.includes('localhost')) {
          logger.warn(
            'RabbitMQ configured with default credentials or localhost — verify QUEUE_RABBITMQ_* env vars in production',
          );
        }

        return {
          uri,
          enableControllerDiscovery: true,
          exchanges: [
            { name: 'zolve.events', type: 'topic', options: { durable: true } },
            { name: 'zolve.dlx', type: 'direct', options: { durable: true } },
          ],
          connectionInitOptions: { wait: false, reject: false, timeout: 30000 },
          connectionManagerOptions: { heartbeatIntervalInSeconds: 30, reconnectTimeInSeconds: 5 },
        };
      },
    }),
  ],
  exports: [RabbitMQModule],
})
export class CronRabbitMQModule {}
