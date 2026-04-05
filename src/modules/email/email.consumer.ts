import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

import { EmailHandler } from './email.handler';
import type { EmailEvent } from './dtos/email.event.dto';

@Injectable()
export class EmailConsumer {
  private readonly logger = new Logger(EmailConsumer.name);

  constructor(private readonly handler: EmailHandler) {}

  @RabbitSubscribe({
    exchange: 'zolve.events',
    routingKey: 'notifications.email',
    queue: 'worker.notifications',
    queueOptions: { durable: true },
  })
  async onEmailEvent(payload: EmailEvent): Promise<void> {
    this.logger.log(`[notifications.email] Processing — to: ${payload.to}, template: ${payload.template_id}`);

    try {
      await this.handler.handle(payload);
      this.logger.log(`[notifications.email] Done — to: ${payload.to}`);
    } catch (error) {
      this.logger.error(`[notifications.email] Failed — to: ${payload.to}`, error);
      throw error; // triggers NACK → DLX
    }
  }
}
