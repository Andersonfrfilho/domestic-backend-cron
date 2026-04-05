import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';

import { RatingHandler } from './rating.handler';
import { RatingConsumer } from './rating.consumer';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderProfile], CONNECTIONS_NAMES.POSTGRES)],
  providers: [RatingHandler, RatingConsumer],
})
export class RatingModule {}
