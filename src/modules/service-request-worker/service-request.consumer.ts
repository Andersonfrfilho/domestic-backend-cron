import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

import { ServiceRequestHandler } from './service-request.handler';
import type { ServiceRequestEvent } from './dtos/service-request.event.dto';

@Injectable()
export class ServiceRequestConsumer {
  private readonly logger = new Logger(ServiceRequestConsumer.name);

  constructor(private readonly handler: ServiceRequestHandler) {}

  @RabbitSubscribe({
    exchange: 'zolve.events',
    routingKey: 'service_request.*',
    queue: 'worker.service-requests',
    queueOptions: { durable: true, arguments: { 'x-dead-letter-exchange': 'zolve.dlx' } },
  })
  async onServiceRequestEvent(payload: ServiceRequestEvent): Promise<void> {
    this.logger.log(`[service_request.*] Processing — event_type: ${payload.event_type}, request_id: ${payload.request_id}`);
    try {
      await this.handler.handle(payload);
      this.logger.log(`[service_request.*] Done — request_id: ${payload.request_id}`);
    } catch (error) {
      this.logger.error(`[service_request.*] Failed — request_id: ${payload.request_id}`, error);
      throw error;
    }
  }
}
