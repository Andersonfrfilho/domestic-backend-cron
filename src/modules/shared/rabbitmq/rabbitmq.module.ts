import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Logger, Module } from '@nestjs/common';

const logger = new Logger('CronRabbitMQModule');

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const LIFECYCLE_LOG_PREFIX = '🐰 RabbitMQ';

        console.log(`${LIFECYCLE_LOG_PREFIX} [INIT] Factory invoked - starting environment variable loading phase`);

        const user = configService.get('QUEUE_RABBITMQ_USER');
        const pass = configService.get('QUEUE_RABBITMQ_PASS');
        const host = configService.get('QUEUE_RABBITMQ_HOST');
        const port = configService.get('QUEUE_RABBITMQ_PORT');
        const rabbitmqUrl = configService.get('RABBITMQ_URL');

        console.log(`${LIFECYCLE_LOG_PREFIX} [ENV] User loaded: ${user ? '✓ set' : '✗ not set'}`);
        console.log(`${LIFECYCLE_LOG_PREFIX} [ENV] Pass loaded: ${pass ? '✓ set' : '✗ not set'}`);
        console.log(`${LIFECYCLE_LOG_PREFIX} [ENV] Host loaded: ${host ? `✓ ${host}` : '✗ not set'}`);
        console.log(`${LIFECYCLE_LOG_PREFIX} [ENV] Port loaded: ${port ? `✓ ${port}` : '✗ not set'}`);
        console.log(`${LIFECYCLE_LOG_PREFIX} [ENV] RabbitMQ URL loaded: ${rabbitmqUrl ? '✓ set' : '✗ not set'}`);

        const uri = rabbitmqUrl || `amqp://${user}:${pass}@${host}:${port}/`;
        console.log(`${LIFECYCLE_LOG_PREFIX} [URI] Constructed: ${rabbitmqUrl ? '[from RABBITMQ_URL]' : `amqp://***:***@${host}:${port}/`}`);

        if (!user || !pass || !host || !port) {
          logger.error(
            `RabbitMQ missing required env vars - User: ${user ? '✓' : '✗'}, Pass: ${pass ? '✓' : '✗'}, Host: ${host ? '✓' : '✗'}, Port: ${port ? '✓' : '✗'}`,
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
      inject: [ConfigService],
    }),
  ],
  exports: [RabbitMQModule],
})
export class CronRabbitMQModule {}
