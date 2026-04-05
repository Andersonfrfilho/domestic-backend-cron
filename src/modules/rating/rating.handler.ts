import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';

import type { ReviewCreatedEvent } from './dtos/review-created.event.dto';

@Injectable()
export class RatingHandler {
  private readonly logger = new Logger(RatingHandler.name);

  constructor(
    @InjectRepository(ProviderProfile, CONNECTIONS_NAMES.POSTGRES)
    private readonly providerRepo: Repository<ProviderProfile>,
  ) {}

  async handle(event: ReviewCreatedEvent): Promise<void> {
    await this.providerRepo
      .createQueryBuilder()
      .update(ProviderProfile)
      .set({
        averageRating: () =>
          `(SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE provider_id = '${event.provider_id}')`,
      })
      .where('id = :id', { id: event.provider_id })
      .execute();

    this.logger.log(`average_rating updated for provider: ${event.provider_id}`);
  }
}
