import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Logger, Module } from '@nestjs/common';

const logger = new Logger('CronRabbitMQModule');

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const user = configService.get('QUEUE_RABBITMQ_USER') || 'guest';
        const pass = configService.get('QUEUE_RABBITMQ_PASS') || 'guest';
        const host = configService.get('QUEUE_RABBITMQ_HOST') || 'localhost';
        const port = configService.get('QUEUE_RABBITMQ_PORT') || '5672';
        const rabbitmqUrl = configService.get('RABBITMQ_URL');

        const uri = rabbitmqUrl || `amqp://${user}:${pass}@${host}:${port}/`;

        console.log('🔍 RabbitMQ URI:', uri);
        console.log('🔍 USER:', user, 'HOST:', host, 'PORT:', port);

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
      inject: [ConfigService],
    }),
  ],
  exports: [RabbitMQModule],
})
export class CronRabbitMQModule {}
