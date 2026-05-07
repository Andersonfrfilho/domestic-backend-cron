import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Logger, Module } from '@nestjs/common';

const logger = new Logger('CronRabbitMQModule');
const LIFECYCLE_LOG_PREFIX = '🐰 RabbitMQ';

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      useFactory: async () => {
        console.log(`${LIFECYCLE_LOG_PREFIX} [INIT] Factory invoked - starting environment variable loading phase`);

        await new Promise(resolve => setImmediate(resolve));
        console.log(`${LIFECYCLE_LOG_PREFIX} [INIT] setImmediate() resolved - env vars now accessible`);

        const user = process.env.QUEUE_RABBITMQ_USER;
        const pass = process.env.QUEUE_RABBITMQ_PASS;
        const host = process.env.QUEUE_RABBITMQ_HOST;
        const port = process.env.QUEUE_RABBITMQ_PORT;

        console.log(`${LIFECYCLE_LOG_PREFIX} [ENV] User loaded: ${user ? `✓ ${user}` : '✗ not set'}`);
        console.log(`${LIFECYCLE_LOG_PREFIX} [ENV] Pass loaded: ${pass ? '✓ set' : '✗ not set'}`);
        console.log(`${LIFECYCLE_LOG_PREFIX} [ENV] Host loaded: ${host ? `✓ ${host}` : '✗ not set'}`);
        console.log(`${LIFECYCLE_LOG_PREFIX} [ENV] Port loaded: ${port ? `✓ ${port}` : '✗ not set'}`);

        const uri =
          process.env.RABBITMQ_URL ||
          `amqp://${user || 'guest'}:${pass || 'guest'}@${host || 'localhost'}:${port || '5672'}/`;

        console.log(`${LIFECYCLE_LOG_PREFIX} [URI] Constructed: amqp://***:***@${host || 'localhost'}:${port || '5672'}/`);

        if (uri.includes('guest') || uri.includes('localhost')) {
          logger.warn(
            'RabbitMQ configured with default credentials or localhost — verify QUEUE_RABBITMQ_* env vars in production',
          );
        }

        console.log(`${LIFECYCLE_LOG_PREFIX} [CONFIG] Returning RabbitMQModule config with enableControllerDiscovery: true`);

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
