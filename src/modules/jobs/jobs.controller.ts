import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AccountCleanupService } from '@modules/account-cleanup/account-cleanup.service';
import { RatingRecalculatorService } from '@modules/rating-recalculator/rating-recalculator.service';
import { RequestReminderService } from '@modules/request-reminder/request-reminder.service';
import { WeeklyReportService } from '@modules/weekly-report/weekly-report.service';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly accountCleanup: AccountCleanupService,
    private readonly ratingRecalculator: RatingRecalculatorService,
    private readonly requestReminder: RequestReminderService,
    private readonly weeklyReport: WeeklyReportService,
  ) {}

  @Post('account-cleanup/run')
  @HttpCode(HttpStatus.OK)
  runAccountCleanup() {
    return this.accountCleanup.run();
  }

  @Post('rating-recalculator/run')
  @HttpCode(HttpStatus.OK)
  runRatingRecalculator() {
    return this.ratingRecalculator.run();
  }

  @Post('request-reminder/run')
  @HttpCode(HttpStatus.OK)
  runRequestReminder() {
    return this.requestReminder.run();
  }

  @Post('weekly-report/run')
  @HttpCode(HttpStatus.OK)
  runWeeklyReport() {
    return this.weeklyReport.run();
  }
}
