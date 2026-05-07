import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';

import { WeeklyReportService } from './weekly-report.service';
import { WeeklyReportJob } from './weekly-report.job';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderProfile], CONNECTIONS_NAMES.POSTGRES)],
  providers: [WeeklyReportService, WeeklyReportJob],
  exports: [WeeklyReportService],
})
export class WeeklyReportModule {}
