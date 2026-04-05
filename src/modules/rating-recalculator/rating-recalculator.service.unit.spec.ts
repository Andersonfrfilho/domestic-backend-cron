import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';

import { RatingRecalculatorService } from './rating-recalculator.service';

const makeRepo = (rows: Array<{ provider_id: string; average_rating: string; review_count: string }>) => ({
  query: jest.fn().mockResolvedValue(rows),
  findOne: jest.fn(),
  update: jest.fn().mockResolvedValue(undefined),
});

describe('RatingRecalculatorService', () => {
  let service: RatingRecalculatorService;
  let repo: ReturnType<typeof makeRepo>;

  const buildModule = async (
    rows: Array<{ provider_id: string; average_rating: string; review_count: string }>,
    findOneResult?: Partial<ProviderProfile> | null,
  ) => {
    repo = makeRepo(rows);
    repo.findOne.mockResolvedValue(findOneResult ?? null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingRecalculatorService,
        { provide: getRepositoryToken(ProviderProfile, CONNECTIONS_NAMES.POSTGRES), useValue: repo },
      ],
    }).compile();

    service = module.get(RatingRecalculatorService);
  };

  it('returns zero counts when no providers to update', async () => {
    await buildModule([]);
    const result = await service.run();
    expect(result.providers_updated).toBe(0);
    expect(result.providers_unchanged).toBe(0);
    expect(result.errors).toBe(0);
  });

  it('updates provider when rating changed', async () => {
    await buildModule(
      [{ provider_id: 'p1', average_rating: '4.50', review_count: '10' }],
      { id: 'p1', averageRating: 3.0 } as ProviderProfile,
    );
    const result = await service.run();
    expect(result.providers_updated).toBe(1);
    expect(repo.update).toHaveBeenCalledWith('p1', { averageRating: 4.5 });
  });

  it('skips update when rating unchanged', async () => {
    await buildModule(
      [{ provider_id: 'p1', average_rating: '4.50', review_count: '10' }],
      { id: 'p1', averageRating: 4.5 } as ProviderProfile,
    );
    const result = await service.run();
    expect(result.providers_unchanged).toBe(1);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('skips when provider not found', async () => {
    await buildModule(
      [{ provider_id: 'ghost', average_rating: '4.00', review_count: '5' }],
      null,
    );
    const result = await service.run();
    expect(result.providers_updated).toBe(0);
    expect(result.errors).toBe(0);
  });

  it('increments errors when update throws', async () => {
    await buildModule(
      [{ provider_id: 'p1', average_rating: '4.50', review_count: '10' }],
      { id: 'p1', averageRating: 3.0 } as ProviderProfile,
    );
    repo.update.mockRejectedValue(new Error('DB error'));
    const result = await service.run();
    expect(result.errors).toBe(1);
  });
});
