import { LoggerModule } from '@adatechnology/logger';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { ConfigModule } from '@config/config.module';
import { HealthModule } from '@modules/health/health.module';

import { MetricsModule } from './modules/metrics/metrics.module';
import { SharedModule } from './modules/shared/shared.module';
import { AccountCleanupModule } from './modules/account-cleanup/account-cleanup.module';
import { RatingRecalculatorModule } from './modules/rating-recalculator/rating-recalculator.module';
import { RequestReminderModule } from './modules/request-reminder/request-reminder.module';
import { WeeklyReportModule } from './modules/weekly-report/weekly-report.module';
import { JobsModule } from './modules/jobs/jobs.module';

@Module({
  imports: [
    MetricsModule,
    ConfigModule,
    LoggerModule.forRoot({ level: process.env.LOG_LEVEL || 'info' }),
    ScheduleModule.forRoot(),
    SharedModule,
    HealthModule,
    AccountCleanupModule,
    RatingRecalculatorModule,
    RequestReminderModule,
    WeeklyReportModule,
    JobsModule,
  ],
})
export class AppModule {}
