import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@modules/shared/providers/database/entities/user.entity';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';
import { MetricsModule } from '@modules/metrics/metrics.module';

import { AccountCleanupService } from './account-cleanup.service';
import { AccountCleanupJob } from './account-cleanup.job';

@Module({
  imports: [TypeOrmModule.forFeature([User], CONNECTIONS_NAMES.POSTGRES), MetricsModule],
  providers: [AccountCleanupService, AccountCleanupJob],
  exports: [AccountCleanupService],
})
export class AccountCleanupModule {}
