import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, OnModuleInit } from '@nestjs/common';

import { AppErrorFactory } from '@modules/error/app.error.factory';
import { MethodNotImplementedErrorCode } from '@modules/error/error-codes';

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

    // Zolve events exchange bindings (used by consumers via @RabbitSubscribe)
    // Consumers declare their own queues with queueOptions, so we just ensure bindings exist
    await channel.bindQueue('worker.rating', 'zolve.events', 'review.created');
    await channel.bindQueue('worker.service-requests', 'zolve.events', 'service_request.*');
    await channel.bindQueue('worker.notifications', 'zolve.events', 'notifications.email');
    await channel.bindQueue('worker.notifications', 'zolve.events', 'notifications.push');
    await channel.bindQueue('worker.provider.approval', 'zolve.events', 'provider.approved');
    await channel.bindQueue('worker.provider.approval', 'zolve.events', 'provider.rejected');

    // Dead letter queue binding
    await channel.bindQueue('worker.dlq', 'zolve.dlx', '');
  }
}
