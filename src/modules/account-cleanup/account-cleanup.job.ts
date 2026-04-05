import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { CronLockService } from '@modules/shared/lock/cron-lock.service';

import { AccountCleanupService } from './account-cleanup.service';

const JOB_NAME = 'account-cleanup';
const JOB_TTL_MS = 15 * 60 * 1000; // 15 min (deleção em cascata pode demorar)

@Injectable()
export class AccountCleanupJob {
  private readonly logger = new Logger(AccountCleanupJob.name);

  constructor(
    private readonly service: AccountCleanupService,
    private readonly lock: CronLockService,
  ) {}

  @Cron(process.env.CRON_ACCOUNT_CLEANUP ?? '0 6 * * 0')
  async run(): Promise<void> {
    const acquired = await this.lock.acquire(JOB_NAME, JOB_TTL_MS);
    if (!acquired) return;

    const executedAt = new Date().toISOString();
    this.logger.log(`[AccountCleanupJob] Starting — executed_at: ${executedAt}`);

    try {
      const result = await this.service.run();
      this.logger.log(JSON.stringify({
        job: 'AccountCleanupJob',
        status: 'completed',
        ...result,
        executed_at: executedAt,
      }));
    } catch (err) {
      this.logger.error(`[AccountCleanupJob] Fatal error`, err);
    } finally {
      await this.lock.release(JOB_NAME);
    }
  }
}
