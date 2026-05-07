import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Logger, Module } from '@nestjs/common';

const logger = new Logger('CronRabbitMQModule');

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      useFactory: async () => {
        console.log('🔍 Factory starting - waiting for env vars to be available...');

        // Retry until all required env vars are available
        let retries = 0;
        let user, pass, host, port;

        while (!user || !pass || !host || !port) {
          user = process.env.QUEUE_RABBITMQ_USER;
          pass = process.env.QUEUE_RABBITMQ_PASS;
          host = process.env.QUEUE_RABBITMQ_HOST;
          port = process.env.QUEUE_RABBITMQ_PORT;

          if (!user || !pass || !host || !port) {
            retries++;
            if (retries <= 10) {
              await new Promise(resolve => setTimeout(resolve, 100));
            } else {
              console.log('🔍 WARNING: Env vars not available after 10 retries, using defaults');
              user = user || 'guest';
              pass = pass || 'guest';
              host = host || 'localhost';
              port = port || '5672';
              break;
            }
          }
        }

        const rabbitmqUrl = process.env.RABBITMQ_URL;
        const uri = rabbitmqUrl || `amqp://${user}:${pass}@${host}:${port}/`;

        console.log('🔍 RabbitMQ URI:', uri);
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
