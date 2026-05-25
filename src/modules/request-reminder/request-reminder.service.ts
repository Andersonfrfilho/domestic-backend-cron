import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';
import { ServiceRequest } from '@modules/shared/providers/database/entities/service-request.entity';

export interface RequestReminderResult {
  reminders_sent: number;
  errors: number;
  duration_ms: number;
}

@Injectable()
export class RequestReminderService {
  private readonly logContext = `${this.constructor.name}.run`;

  constructor(
    @InjectRepository(ServiceRequest, CONNECTIONS_NAMES.POSTGRES)
    private readonly serviceRequestRepo: Repository<ServiceRequest>,
    private readonly amqp: AmqpConnection,
    @Inject(LOGGER_PROVIDER) private readonly logger: LogProviderInterface,
  ) {}

  @TraceMethod()
  async run(): Promise<RequestReminderResult> {
    const start = Date.now();
    let reminders_sent = 0;
    let errors = 0;

    const reminderHours = Number(process.env.PENDING_REQUEST_REMINDER_HOURS ?? 24);

    const pendingRequests: Array<{
      id: string;
      contractor_id: string;
      provider_id: string;
      scheduled_at: Date;
    }> = await this.serviceRequestRepo.query(`
      SELECT
        sr.id,
        sr.contractor_id,
        sr.provider_id,
        sr.scheduled_at
      FROM service_requests sr
      WHERE sr.status = 'ACCEPTED'
        AND sr.scheduled_at BETWEEN NOW() AND NOW() + INTERVAL '${reminderHours} hours'
        AND NOT EXISTS (
          SELECT 1 FROM cron_reminder_log crl
          WHERE crl.entity_id = sr.id
            AND crl.reminder_type = 'service_request_reminder'
            AND crl.sent_at >= NOW() - INTERVAL '${reminderHours} hours'
        )
    `);

    this.logger.info({
      message: `Found ${pendingRequests.length} service requests needing reminders`,
      context: this.logContext,
    });

    for (const request of pendingRequests) {
      try {
        await this.amqp.publish('zolve.events', 'notifications.reminder', {
          entity_id: request.id,
          contractor_id: request.contractor_id,
          provider_id: request.provider_id,
          scheduled_at: request.scheduled_at,
          reminder_type: 'service_request_reminder',
        });
        reminders_sent++;
      } catch (err) {
        this.logger.error({
          message: `Failed to publish reminder for request ${request.id}`,
          context: this.logContext,
          params: { error: (err as Error)?.message },
        });
        errors++;
      }
    }

    return { reminders_sent, errors, duration_ms: Date.now() - start };
  }
}
