import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Logger, Module } from '@nestjs/common';

const logger = new Logger('CronRabbitMQModule');

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      useFactory: async () => {
        console.log('🔍 [FACTORY START] Entering factory');
        console.log('🔍 [BEFORE DELAY] env.USER=', process.env.QUEUE_RABBITMQ_USER, 'env.HOST=', process.env.QUEUE_RABBITMQ_HOST);

        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('🔍 [AFTER 500ms] env.USER=', process.env.QUEUE_RABBITMQ_USER, 'env.HOST=', process.env.QUEUE_RABBITMQ_HOST);

        const rabbitmqUrl = process.env.RABBITMQ_URL;
        const user = process.env.QUEUE_RABBITMQ_USER;
        const pass = process.env.QUEUE_RABBITMQ_PASS;
        const host = process.env.QUEUE_RABBITMQ_HOST;
        const port = process.env.QUEUE_RABBITMQ_PORT;

        console.log('🔍 [RAW VALUES] user=', user, 'pass=', pass ? 'SET' : 'UNSET', 'host=', host, 'port=', port);

        const uri = rabbitmqUrl || `amqp://${user || 'guest'}:${pass || 'guest'}@${host || 'localhost'}:${port || '5672'}/`;

        console.log('🔍 [FINAL URI]:', uri);
        console.log('🔍 [PARSED] QUEUE_RABBITMQ_USER:', process.env.QUEUE_RABBITMQ_USER);
        console.log('🔍 [PARSED] QUEUE_RABBITMQ_HOST:', process.env.QUEUE_RABBITMQ_HOST);
        console.log('🔍 [PARSED] QUEUE_RABBITMQ_PORT:', process.env.QUEUE_RABBITMQ_PORT);

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
