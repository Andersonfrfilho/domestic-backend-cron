import { Module } from '@nestjs/common';

import { AccountCleanupModule } from '@modules/account-cleanup/account-cleanup.module';
import { RatingRecalculatorModule } from '@modules/rating-recalculator/rating-recalculator.module';
import { RequestReminderModule } from '@modules/request-reminder/request-reminder.module';
import { WeeklyReportModule } from '@modules/weekly-report/weekly-report.module';

import { JobsController } from './jobs.controller';

@Module({
  imports: [
    AccountCleanupModule,
    RatingRecalculatorModule,
    RequestReminderModule,
    WeeklyReportModule,
  ],
  controllers: [JobsController],
})
export class JobsModule {}
