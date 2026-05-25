import { LoggerModule, REQUEST_ID_FORMAT } from '@adatechnology/nestjs-logger';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { ConfigModule } from '@config/config.module';
import { HealthModule } from '@modules/health/health.module';

import { AccountCleanupModule } from './modules/account-cleanup/account-cleanup.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { RatingRecalculatorModule } from './modules/rating-recalculator/rating-recalculator.module';
import { RequestReminderModule } from './modules/request-reminder/request-reminder.module';
import { SharedModule } from './modules/shared/shared.module';
import { WeeklyReportModule } from './modules/weekly-report/weekly-report.module';

@Module({
  imports: [
    MetricsModule,
    ConfigModule,
    LoggerModule.forRoot({
      enableTraceStack: true,
      requestIdFormat: REQUEST_ID_FORMAT.SHORT_HASH,
      colorize: process.stdout.isTTY,
      isProduction: !process.stdout.isTTY,
      appName: 'backend-cron',
      appVersion: '0.0.1',
      level: process.env.LOG_LEVEL || 'info',
      interceptorExcludedPaths: ['/health', '/metrics'],
    }),
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
