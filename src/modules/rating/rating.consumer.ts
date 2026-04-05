import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

import { RatingHandler } from './rating.handler';
import type { ReviewCreatedEvent } from './dtos/review-created.event.dto';

@Injectable()
export class RatingConsumer {
  private readonly logger = new Logger(RatingConsumer.name);

  constructor(private readonly handler: RatingHandler) {}

  @RabbitSubscribe({
    exchange: 'zolve.events',
    routingKey: 'review.created',
    queue: 'worker.rating',
    queueOptions: { durable: true, arguments: { 'x-dead-letter-exchange': 'zolve.dlx' } },
  })
  async onReviewCreated(payload: ReviewCreatedEvent): Promise<void> {
    this.logger.log(`[review.created] Processing — provider_id: ${payload.provider_id}`);
    try {
      await this.handler.handle(payload);
      this.logger.log(`[review.created] Done — provider_id: ${payload.provider_id}`);
    } catch (error) {
      this.logger.error(`[review.created] Failed — provider_id: ${payload.provider_id}`, error);
      throw error;
    }
  }
}
