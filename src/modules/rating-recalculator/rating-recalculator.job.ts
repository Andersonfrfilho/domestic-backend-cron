import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { CronLockService } from '@modules/shared/lock/cron-lock.service';

import { RatingRecalculatorService } from './rating-recalculator.service';

const JOB_NAME = 'rating-recalculator';
const JOB_TTL_MS = 10 * 60 * 1000; // 10 min

@Injectable()
export class RatingRecalculatorJob {
  private readonly logger = new Logger(RatingRecalculatorJob.name);

  constructor(
    private readonly service: RatingRecalculatorService,
    private readonly lock: CronLockService,
  ) {}

  @Cron(process.env.CRON_RATING_RECALCULATOR ?? '0 5 * * *')
  async run(): Promise<void> {
    const acquired = await this.lock.acquire(JOB_NAME, JOB_TTL_MS);
    if (!acquired) return;

    const executedAt = new Date().toISOString();
    this.logger.log(`[RatingRecalculatorJob] Starting — executed_at: ${executedAt}`);

    try {
      const result = await this.service.run();
      this.logger.log(JSON.stringify({
        job: 'RatingRecalculatorJob',
        status: 'completed',
        ...result,
        executed_at: executedAt,
      }));
    } catch (err) {
      this.logger.error(`[RatingRecalculatorJob] Fatal error`, err);
    } finally {
      await this.lock.release(JOB_NAME);
    }
  }
}
