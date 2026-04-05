import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

import { ProviderVerification } from '@modules/shared/providers/database/entities/provider-verification.entity';
import { ProviderVerificationLog } from '@modules/shared/providers/database/entities/provider-verification-log.entity';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';

import { NotificationHandler } from '@modules/notification/notification.handler';

import type { ProviderApprovalEvent } from './dtos/provider-approval.event.dto';

@Injectable()
export class ProviderApprovalHandler {
  private readonly logger = new Logger(ProviderApprovalHandler.name);

  constructor(
    @InjectRepository(ProviderVerification, CONNECTIONS_NAMES.POSTGRES)
    private readonly verificationRepo: Repository<ProviderVerification>,
    @InjectRepository(ProviderVerificationLog, CONNECTIONS_NAMES.POSTGRES)
    private readonly logRepo: Repository<ProviderVerificationLog>,
    private readonly amqp: AmqpConnection,
    private readonly notificationHandler: NotificationHandler,
  ) {}

  async handleApproved(event: ProviderApprovalEvent): Promise<void> {
    await this.updateVerificationStatus(event.provider_id, 'APPROVED', undefined);
    await this.persistLog(event.provider_id, 'APPROVED', undefined);
    await this.notificationHandler.persist({
      user_id: event.user_id,
      message: 'Parabéns! Seu perfil foi verificado e aprovado.',
      metadata: { event_type: 'provider.approved', entity_id: event.provider_id, entity_type: 'provider' },
    });
    this.publishNotifications(event, 'APPROVED');
  }

  async handleRejected(event: ProviderApprovalEvent): Promise<void> {
    await this.updateVerificationStatus(event.provider_id, 'REJECTED', event.reason);
    await this.persistLog(event.provider_id, 'REJECTED', event.reason);
    await this.notificationHandler.persist({
      user_id: event.user_id,
      message: 'Seu perfil foi rejeitado. Verifique os motivos e corrija as informações.',
      metadata: { event_type: 'provider.rejected', entity_id: event.provider_id, entity_type: 'provider' },
    });
    this.publishNotifications(event, 'REJECTED');
  }

  private async updateVerificationStatus(providerId: string, status: string, notes?: string): Promise<void> {
    const verification = await this.verificationRepo.findOne({ where: { providerId }, order: { submittedAt: 'DESC' } });

    if (!verification) {
      this.logger.warn(`Verification not found for provider: ${providerId}`);
      return;
    }

    if (verification.status === status) {
      this.logger.warn(`[idempotent] Verification already ${status} for provider: ${providerId}`);
      return;
    }

    await this.verificationRepo.update(verification.id, { status, notes, reviewedAt: new Date() });
  }

  private async persistLog(providerId: string, action: string, notes?: string): Promise<void> {
    const verification = await this.verificationRepo.findOne({ where: { providerId }, order: { submittedAt: 'DESC' } });
    if (!verification) return;

    const log = Object.assign(this.logRepo.create(), {
      verificationId: verification.id,
      action,
      previousStatus: 'UNDER_REVIEW',
      newStatus: action,
      notes: notes,
    } as Partial<ProviderVerificationLog>);
    await this.logRepo.save(log);
  }

  private publishNotifications(event: ProviderApprovalEvent, status: 'APPROVED' | 'REJECTED'): void {
    const templateId = status === 'APPROVED' ? 'verification-approved' : 'verification-rejected';

    this.amqp.publish('zolve.events', 'notifications.email', {
      to: event.email,
      template_id: templateId,
      variables: { provider_name: event.email, reason: event.reason ?? '' },
    }).catch((err) => this.logger.error('Failed to publish email event', err));

    if (event.fcm_token) {
      this.amqp.publish('zolve.events', 'notifications.push', {
        user_id: event.user_id,
        fcm_token: event.fcm_token,
        title: status === 'APPROVED' ? 'Perfil aprovado!' : 'Perfil rejeitado',
        body: status === 'APPROVED'
          ? 'Seu perfil foi verificado. Comece a receber solicitações!'
          : `Seu perfil foi rejeitado. ${event.reason ?? 'Verifique os detalhes.'}`,
        data: { type: 'provider_verification', provider_id: event.provider_id },
      }).catch((err) => this.logger.error('Failed to publish push event', err));
    }
  }
}
