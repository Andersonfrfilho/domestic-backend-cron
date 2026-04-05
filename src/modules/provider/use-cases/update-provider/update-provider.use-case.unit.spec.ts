import { Test } from '@nestjs/testing';

import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';
import { UpdateProviderUseCase } from './update-provider.use-case';

const mockRepo = { findById: jest.fn(), update: jest.fn() };

const provider = { id: 'prov-1', userId: 'user-1', bio: 'Old bio', status: 'APPROVED' };

describe('UpdateProviderUseCase', () => {
  let useCase: UpdateProviderUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UpdateProviderUseCase,
        { provide: PROVIDER_REPOSITORY_PROVIDE, useValue: mockRepo },
      ],
    }).compile();
    useCase = module.get(UpdateProviderUseCase);
    jest.clearAllMocks();
  });

  it('updates provider when found', async () => {
    mockRepo.findById.mockResolvedValue(provider);
    mockRepo.update.mockResolvedValue({ ...provider, bio: 'New bio' });

    const result = await useCase.execute({ id: 'prov-1', bio: 'New bio' });

    expect(result.bio).toBe('New bio');
    expect(mockRepo.update).toHaveBeenCalledWith('prov-1', { bio: 'New bio' });
  });

  it('throws when provider not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'prov-1', bio: 'New bio' })).rejects.toThrow();
    expect(mockRepo.update).not.toHaveBeenCalled();
  });
});
