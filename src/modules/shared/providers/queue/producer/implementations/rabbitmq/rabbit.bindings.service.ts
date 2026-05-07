import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { AppErrorFactory } from '@modules/error/app.error.factory';
import { MethodNotImplementedErrorCode } from '@modules/error/error-codes';
import { CRON_RABBITMQ_QUEUES, CRON_RABBITMQ_EXCHANGES } from '@config/rabbitmq.queues';

@Injectable()
export class RabbitBindingsService implements OnModuleInit {
  private readonly logger = new Logger(RabbitBindingsService.name);

  constructor(private readonly amqpConnection: AmqpConnection) {}

  async onModuleInit() {
    this.logger.log('Starting RabbitMQ bindings initialization...');
    try {
      await this.waitForChannel();
      await this.verifyExchanges();
      await this.createBindings();
      this.logger.log('✅ RabbitMQ bindings created successfully');
    } catch (error) {
      this.logger.error('❌ Error creating RabbitMQ bindings:', error instanceof Error ? error.message : String(error), error instanceof Error ? error.stack : '');
    }
  }

  private async waitForChannel(maxRetries = 10, delayMs = 100): Promise<void> {
    this.logger.log(`Waiting for RabbitMQ channel (max ${maxRetries} retries, ${delayMs}ms between)...`);
    for (let i = 0; i < maxRetries; i++) {
      try {
        const channel = this.amqpConnection.channel;
        if (channel) {
          this.logger.log(`✅ RabbitMQ channel available on attempt ${i + 1}`);
          return;
        }
      } catch (error) {
        this.logger.debug(`Channel not ready on attempt ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    const errorMsg = `RabbitMQ channel not available after ${maxRetries} retries`;
    this.logger.error(errorMsg);
    throw AppErrorFactory.businessLogic({
      message: errorMsg,
      code: MethodNotImplementedErrorCode.METHOD_NOT_IMPLEMENTED,
    });
  }

  private async verifyExchanges(): Promise<void> {
    const channel = this.amqpConnection.channel;
    this.logger.log('Verifying RabbitMQ exchanges...');

    for (const exchange of Object.values(CRON_RABBITMQ_EXCHANGES)) {
      try {
        this.logger.log(`Checking exchange: ${exchange.name} (type: ${exchange.type})`);
        await channel.assertExchange(exchange.name, exchange.type, { durable: true });
        this.logger.log(`✅ Exchange verified: ${exchange.name}`);
      } catch (error) {
        this.logger.warn(`⚠️ Error verifying exchange ${exchange.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  private async createBindings(): Promise<void> {
    const channel = this.amqpConnection.channel;
    const queues = CRON_RABBITMQ_QUEUES;

    this.logger.log('Asserting RabbitMQ queues...');
    // First ensure all queues exist (already declared via @RabbitSubscribe, but just in case)
    for (const queueKey of Object.keys(queues)) {
      const queue = queues[queueKey as keyof typeof queues];
      try {
        const isDLQ = queue.name === 'worker.dlq';
        const queueOptions: any = { durable: true };

        // Only add DLX argument for non-DLQ queues
        if (!isDLQ) {
          queueOptions.arguments = { 'x-dead-letter-exchange': 'zolve.dlx' };
        }

        this.logger.log(`Asserting queue: ${queue.name} (durable: true, dlx: ${isDLQ ? 'N/A (is DLQ)' : 'zolve.dlx'})`);
        const assertResult = await channel.assertQueue(queue.name, queueOptions);
        this.logger.log(`✅ Queue asserted: ${queue.name} (consumers: ${assertResult.consumerCount}, messages: ${assertResult.messageCount})`);
      } catch (error) {
        this.logger.warn(`⚠️ Error asserting queue ${queue.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    this.logger.log('Binding queues to exchanges...');
    // Then bind each queue to its exchange with its routing keys
    for (const queueKey of Object.keys(queues)) {
      const queue = queues[queueKey as keyof typeof queues];
      for (const routingKey of queue.routingKeys) {
        if (!routingKey) continue; // Skip empty routing keys
        try {
          this.logger.log(`Binding ${queue.name} to ${queue.exchange} with routing key: ${routingKey}`);
          await channel.bindQueue(queue.name, queue.exchange, routingKey);
          this.logger.log(`✅ Queue bound: ${queue.name} -> ${queue.exchange} [${routingKey}]`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          if (errorMsg.includes('PRECONDITION_FAILED')) {
            this.logger.error(`❌ PRECONDITION_FAILED binding ${queue.name}: ${errorMsg}. Queue may have been previously created with incompatible options. Delete and restart pod.`);
          } else {
            this.logger.warn(`⚠️ Error binding ${queue.name} to ${queue.exchange}: ${errorMsg}`);
          }
        }
      }
    }
  }
}
