import { LOGGER_PROVIDER, runWithContext } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { CronMetricsService } from '@modules/metrics/cron-metrics.service';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CronLockService } from '@modules/shared/lock/cron-lock.service';

import { WeeklyReportService } from './weekly-report.service';

const JOB_NAME = 'weekly-report';
const JOB_TTL_MS = 10 * 60 * 1000; // 10 min

function cronRunId(job: string): string {
  return `cron:${job}:${Date.now().toString(36)}`;
}

@Injectable()
export class WeeklyReportJob {
  private readonly logContext = `${this.constructor.name}.run`;

  constructor(
    private readonly service: WeeklyReportService,
    private readonly lock: CronLockService,
    private readonly metrics: CronMetricsService,
    @Inject(LOGGER_PROVIDER) private readonly logger: LogProviderInterface,
  ) {}

  @Cron(process.env.CRON_WEEKLY_REPORT ?? '0 8 * * 1')
  async run(): Promise<void> {
    const acquired = await this.lock.acquire(JOB_NAME, JOB_TTL_MS);
    if (!acquired) return;

    const requestId = cronRunId(JOB_NAME);
    const startTime = Date.now();
    const executedAt = new Date().toISOString();

    await runWithContext({ requestId }, async () => {
      this.logger.info({
        message: 'Starting',
        context: this.logContext,
        params: { executed_at: executedAt },
      });

      try {
        const result = await this.service.run();
        this.logger.info({
          message: 'Completed',
          context: this.logContext,
          params: { job: JOB_NAME, status: 'completed', ...result, executed_at: executedAt },
        });
        this.metrics.record(JOB_NAME, 'success', Date.now() - startTime);
      } catch (err) {
        this.logger.error({
          message: 'Fatal error',
          context: this.logContext,
          params: { error: (err as Error)?.message },
        });
        this.metrics.record(JOB_NAME, 'failed', Date.now() - startTime);
      } finally {
        await this.lock.release(JOB_NAME);
      }
    });
  }
}
