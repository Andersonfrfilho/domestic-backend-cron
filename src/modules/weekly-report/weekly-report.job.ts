import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { CronLockService } from '@modules/shared/lock/cron-lock.service';

import { WeeklyReportService } from './weekly-report.service';

const JOB_NAME = 'weekly-report';
const JOB_TTL_MS = 10 * 60 * 1000; // 10 min

@Injectable()
export class WeeklyReportJob {
  private readonly logger = new Logger(WeeklyReportJob.name);

  constructor(
    private readonly service: WeeklyReportService,
    private readonly lock: CronLockService,
  ) {}

  @Cron(process.env.CRON_WEEKLY_REPORT ?? '0 8 * * 1')
  async run(): Promise<void> {
    const acquired = await this.lock.acquire(JOB_NAME, JOB_TTL_MS);
    if (!acquired) return;

    const executedAt = new Date().toISOString();
    this.logger.log(`[WeeklyReportJob] Starting — executed_at: ${executedAt}`);

    try {
      const result = await this.service.run();
      this.logger.log(JSON.stringify({
        job: 'WeeklyReportJob',
        status: 'completed',
        ...result,
        executed_at: executedAt,
      }));
    } catch (err) {
      this.logger.error(`[WeeklyReportJob] Fatal error`, err);
    } finally {
      await this.lock.release(JOB_NAME);
    }
  }
}
