import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';
import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';
import { Review } from '@modules/shared/providers/database/entities/review.entity';

export interface RatingRecalculatorResult {
  providers_updated: number;
  providers_unchanged: number;
  errors: number;
  duration_ms: number;
}

const BATCH_SIZE = 100;

@Injectable()
export class RatingRecalculatorService {
  private readonly logger = new Logger(RatingRecalculatorService.name);

  constructor(
    @InjectRepository(ProviderProfile, CONNECTIONS_NAMES.POSTGRES)
    private readonly providerRepo: Repository<ProviderProfile>,
    @InjectRepository(Review, CONNECTIONS_NAMES.POSTGRES)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  async run(): Promise<RatingRecalculatorResult> {
    const start = Date.now();
    let providers_updated = 0;
    let providers_unchanged = 0;
    let errors = 0;

    const windowDays = Number(process.env.RATING_RECALC_WINDOW_DAYS ?? 30);

    // Busca médias de rating por prestador via Review repository
    const rows: Array<{ provider_id: string; average_rating: string; review_count: string }> =
      await this.reviewRepo
        .createQueryBuilder('r')
        .select('r.provider_id', 'provider_id')
        .addSelect('AVG(r.rating)::DECIMAL(3,2)', 'average_rating')
        .addSelect('COUNT(*)::INT', 'review_count')
        .where('r.created_at >= NOW() - CAST(:window AS INTERVAL)', {
          window: `${windowDays} days`,
        })
        .groupBy('r.provider_id')
        .getRawMany();

    this.logger.log(`Found ${rows.length} providers to recalculate`);

    // Processa em batches
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (row) => {
          try {
            const newRating = parseFloat(row.average_rating);
            const provider = await this.providerRepo.findOne({ where: { id: row.provider_id } });

            if (!provider) {
              this.logger.warn(`Provider not found: ${row.provider_id}`);
              return;
            }

            if (Number(provider.averageRating) === newRating) {
              providers_unchanged++;
              return;
            }

            await this.providerRepo.update(row.provider_id, { averageRating: newRating });
            providers_updated++;
          } catch (err) {
            this.logger.error(`Error updating provider ${row.provider_id}`, err);
            errors++;
          }
        }),
      );
    }

    return { providers_updated, providers_unchanged, errors, duration_ms: Date.now() - start };
  }
}
