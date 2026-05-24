import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';

// Cron is a producer only — it publishes events to the exchange.
// Queue declaration and binding is the responsibility of the Worker (consumer).
// This service is kept for future use but does nothing on init.
@Injectable()
export class RabbitBindingsService {
  private readonly logger = new Logger(RabbitBindingsService.name);

  constructor(private readonly amqpConnection: AmqpConnection) {}
}
