import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MetricsModule } from '@modules/metrics/metrics.module';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';
import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';
import { Review } from '@modules/shared/providers/database/entities/review.entity';

import { RatingRecalculatorJob } from './rating-recalculator.job';
import { RatingRecalculatorService } from './rating-recalculator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProviderProfile, Review], CONNECTIONS_NAMES.POSTGRES),
    MetricsModule,
  ],
  providers: [RatingRecalculatorService, RatingRecalculatorJob],
  exports: [RatingRecalculatorService],
})
export class RatingRecalculatorModule {}
