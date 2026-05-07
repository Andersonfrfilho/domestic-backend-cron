import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, OnModuleInit } from '@nestjs/common';

import { AppErrorFactory } from '@modules/error/app.error.factory';
import { MethodNotImplementedErrorCode } from '@modules/error/error-codes';
import { CRON_RABBITMQ_QUEUES } from '@config/rabbitmq.queues';

@Injectable()
export class RabbitBindingsService implements OnModuleInit {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async onModuleInit() {
    try {
      await this.waitForChannel();
      await this.createBindings();
      console.log('✅ RabbitMQ bindings created successfully');
    } catch (error) {
      console.error('❌ Error creating RabbitMQ bindings:', error);
    }
  }

  private async waitForChannel(maxRetries = 10, delayMs = 100): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const channel = this.amqpConnection.channel;
        if (channel) {
          console.log('🔗 RabbitMQ channel available, creating bindings...');
          return;
        }
      } catch {
        // Channel not ready yet
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    throw AppErrorFactory.businessLogic({
      message: 'RabbitMQ channel not available after retries',
      code: MethodNotImplementedErrorCode.METHOD_NOT_IMPLEMENTED,
    });
  }

  private async createBindings() {
    const channel = this.amqpConnection.channel;

    const queues = CRON_RABBITMQ_QUEUES;

    // Bind each queue to its exchange with its routing keys
    for (const queue of Object.values(queues)) {
      for (const routingKey of queue.routingKeys) {
        await channel.bindQueue(queue.name, queue.exchange, routingKey);
      }
    }
  }
}
