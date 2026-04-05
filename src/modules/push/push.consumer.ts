import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

import { PushHandler } from './push.handler';
import type { PushEvent } from './dtos/push.event.dto';

@Injectable()
export class PushConsumer {
  private readonly logger = new Logger(PushConsumer.name);

  constructor(private readonly handler: PushHandler) {}

  @RabbitSubscribe({
    exchange: 'zolve.events',
    routingKey: 'notifications.push',
    queue: 'worker.notifications',
    queueOptions: { durable: true },
  })
  async onPushEvent(payload: PushEvent): Promise<void> {
    this.logger.log(`[notifications.push] Processing — user: ${payload.user_id}`);

    try {
      await this.handler.handle(payload);
      this.logger.log(`[notifications.push] Done — user: ${payload.user_id}`);
    } catch (error) {
      this.logger.error(`[notifications.push] Failed — user: ${payload.user_id}`, error);
      throw error;
    }
  }
}
