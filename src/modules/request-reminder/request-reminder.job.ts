import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { CronLockService } from '@modules/shared/lock/cron-lock.service';

import { RequestReminderService } from './request-reminder.service';

const JOB_NAME = 'request-reminder';
const JOB_TTL_MS = 5 * 60 * 1000; // 5 min

@Injectable()
export class RequestReminderJob {
  private readonly logger = new Logger(RequestReminderJob.name);

  constructor(
    private readonly service: RequestReminderService,
    private readonly lock: CronLockService,
  ) {}

  @Cron(process.env.CRON_REQUEST_REMINDER ?? '0 * * * *')
  async run(): Promise<void> {
    const acquired = await this.lock.acquire(JOB_NAME, JOB_TTL_MS);
    if (!acquired) return;

    const executedAt = new Date().toISOString();
    this.logger.log(`[RequestReminderJob] Starting — executed_at: ${executedAt}`);

    try {
      const result = await this.service.run();
      this.logger.log(JSON.stringify({
        job: 'RequestReminderJob',
        status: 'completed',
        ...result,
        executed_at: executedAt,
      }));
    } catch (err) {
      this.logger.error(`[RequestReminderJob] Fatal error`, err);
    } finally {
      await this.lock.release(JOB_NAME);
    }
  }
}
