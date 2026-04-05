import { Global, Module } from '@nestjs/common';

import { CronLockService } from './cron-lock.service';

@Global()
@Module({
  providers: [CronLockService],
  exports: [CronLockService],
})
export class CronLockModule {}
