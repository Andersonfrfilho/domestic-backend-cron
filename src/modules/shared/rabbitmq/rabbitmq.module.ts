import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Logger, Module } from '@nestjs/common';

const logger = new Logger('CronRabbitMQModule');

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        console.log('🐰 [DEBUG] ConfigService keys:', Object.keys(configService));

        const user = configService.get('QUEUE_RABBITMQ_USER');
        const pass = configService.get('QUEUE_RABBITMQ_PASS');
        const host = configService.get('QUEUE_RABBITMQ_HOST');
        const port = configService.get('QUEUE_RABBITMQ_PORT');
        const rabbitmqUrl = configService.get('RABBITMQ_URL');

        console.log(`🐰 [ENV] Raw values: user="${user}", pass="${pass}", host="${host}", port="${port}", url="${rabbitmqUrl}"`);

        const uri = rabbitmqUrl || `amqp://${user}:${pass}@${host}:${port}/`;
        console.log(`🐰 [URI] Final URI: amqp://***:***@${host}:${port}/`);

        return {
          uri,
          enableControllerDiscovery: true,
          exchanges: [
            { name: 'zolve.events', type: 'topic', options: { durable: true } },
            { name: 'zolve.dlx', type: 'fanout', options: { durable: true } },
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
