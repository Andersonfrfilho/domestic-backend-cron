import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';

import { RatingHandler } from './rating.handler';

const mockQb = {
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue({ affected: 1 }),
};

const mockRepo = { createQueryBuilder: jest.fn(() => mockQb) };

describe('RatingHandler', () => {
  let handler: RatingHandler;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RatingHandler,
        { provide: getRepositoryToken(ProviderProfile, CONNECTIONS_NAMES.POSTGRES), useValue: mockRepo },
      ],
    }).compile();

    handler = module.get(RatingHandler);
    jest.clearAllMocks();
    mockRepo.createQueryBuilder.mockReturnValue(mockQb);
    mockQb.update.mockReturnThis();
    mockQb.set.mockReturnThis();
    mockQb.where.mockReturnThis();
    mockQb.execute.mockResolvedValue({ affected: 1 });
  });

  it('updates average_rating via query builder', async () => {
    await handler.handle({ review_id: 'rev-1', provider_id: 'prov-1', rating: 5 });

    expect(mockRepo.createQueryBuilder).toHaveBeenCalled();
    expect(mockQb.execute).toHaveBeenCalled();
  });
});
