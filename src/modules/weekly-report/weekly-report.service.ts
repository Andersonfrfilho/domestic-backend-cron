import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';
import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';

export interface WeeklyReportResult {
  reports_sent: number;
  providers_processed: number;
  errors: number;
  duration_ms: number;
}

@Injectable()
export class WeeklyReportService {
  private readonly logContext = `${this.constructor.name}.run`;

  constructor(
    @InjectRepository(ProviderProfile, CONNECTIONS_NAMES.POSTGRES)
    private readonly providerRepo: Repository<ProviderProfile>,
    private readonly amqp: AmqpConnection,
    @Inject(LOGGER_PROVIDER) private readonly logger: LogProviderInterface,
  ) {}

  @TraceMethod()
  async run(): Promise<WeeklyReportResult> {
    const start = Date.now();
    let reports_sent = 0;
    let providers_processed = 0;
    let errors = 0;

    const providers: Array<{
      provider_id: string;
      user_id: string;
      completed_count: string;
      cancelled_count: string;
      total_earned: string;
      average_rating: string;
    }> = await this.providerRepo.query(`
      SELECT
        pp.id                                     AS provider_id,
        pp.user_id,
        COUNT(sr.id) FILTER (WHERE sr.status = 'COMPLETED')  AS completed_count,
        COUNT(sr.id) FILTER (WHERE sr.status = 'CANCELLED')  AS cancelled_count,
        COALESCE(SUM(sr.price_final) FILTER (WHERE sr.status = 'COMPLETED'), 0) AS total_earned,
        COALESCE(AVG(r.rating), 0)::DECIMAL(3,2)  AS average_rating
      FROM provider_profiles pp
      LEFT JOIN service_requests sr
        ON sr.provider_id = pp.id
        AND sr.created_at >= NOW() - INTERVAL '7 days'
      LEFT JOIN reviews r
        ON r.provider_id = pp.id
        AND r.created_at >= NOW() - INTERVAL '7 days'
      WHERE pp.is_available = true
      GROUP BY pp.id, pp.user_id
      HAVING COUNT(sr.id) > 0
    `);

    this.logger.info({
      message: `Generating weekly reports for ${providers.length} active providers`,
      context: this.logContext,
    });

    for (const provider of providers) {
      providers_processed++;
      try {
        await this.amqp.publish('zolve.events', 'notifications.email', {
          user_id: provider.user_id,
          template_id: 'weekly-provider-report',
          variables: {
            completed_count: provider.completed_count,
            cancelled_count: provider.cancelled_count,
            total_earned: provider.total_earned,
            average_rating: provider.average_rating,
            week_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            week_end: new Date().toISOString().split('T')[0],
          },
        });
        reports_sent++;
      } catch (err) {
        this.logger.error({
          message: `Failed to publish weekly report for provider ${provider.provider_id}`,
          context: this.logContext,
          params: { error: (err as Error)?.message },
        });
        errors++;
      }
    }

    return { reports_sent, providers_processed, errors, duration_ms: Date.now() - start };
  }
}
