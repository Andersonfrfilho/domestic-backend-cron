import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';

import { RatingRecalculatorService } from './rating-recalculator.service';
import { RatingRecalculatorJob } from './rating-recalculator.job';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderProfile], CONNECTIONS_NAMES.POSTGRES)],
  providers: [RatingRecalculatorService, RatingRecalculatorJob],
  exports: [RatingRecalculatorService],
})
export class RatingRecalculatorModule {}
