import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

import { ProviderApprovalHandler } from './provider-approval.handler';
import type { ProviderApprovalEvent } from './dtos/provider-approval.event.dto';

@Injectable()
export class ProviderApprovalConsumer {
  private readonly logger = new Logger(ProviderApprovalConsumer.name);

  constructor(private readonly handler: ProviderApprovalHandler) {}

  @RabbitSubscribe({
    exchange: 'zolve.events',
    routingKey: 'provider.approved',
    queue: 'worker.provider.approval',
    queueOptions: { durable: true, arguments: { 'x-dead-letter-exchange': 'zolve.dlx' } },
  })
  async onProviderApproved(payload: ProviderApprovalEvent): Promise<void> {
    this.logger.log(`[provider.approved] Processing — provider_id: ${payload.provider_id}`);
    try {
      await this.handler.handleApproved(payload);
      this.logger.log(`[provider.approved] Done — provider_id: ${payload.provider_id}`);
    } catch (error) {
      this.logger.error(`[provider.approved] Failed — provider_id: ${payload.provider_id}`, error);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: 'zolve.events',
    routingKey: 'provider.rejected',
    queue: 'worker.provider.approval',
    queueOptions: { durable: true, arguments: { 'x-dead-letter-exchange': 'zolve.dlx' } },
  })
  async onProviderRejected(payload: ProviderApprovalEvent): Promise<void> {
    this.logger.log(`[provider.rejected] Processing — provider_id: ${payload.provider_id}`);
    try {
      await this.handler.handleRejected(payload);
      this.logger.log(`[provider.rejected] Done — provider_id: ${payload.provider_id}`);
    } catch (error) {
      this.logger.error(`[provider.rejected] Failed — provider_id: ${payload.provider_id}`, error);
      throw error;
    }
  }
}
