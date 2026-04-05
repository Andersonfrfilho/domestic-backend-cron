import { CACHE_PROVIDER } from '@adatechnology/cache';
import { Test } from '@nestjs/testing';

import { CATEGORY_REPOSITORY_PROVIDE } from '../../category.token';
import { DeleteCategoryUseCase } from './delete-category.use-case';

const mockRepo = { findById: jest.fn(), deactivate: jest.fn() };
const mockCache = { del: jest.fn().mockResolvedValue(null) };

const category = { id: 'cat-1', name: 'Limpeza', slug: 'limpeza', isActive: true };

describe('DeleteCategoryUseCase', () => {
  let useCase: DeleteCategoryUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DeleteCategoryUseCase,
        { provide: CATEGORY_REPOSITORY_PROVIDE, useValue: mockRepo },
        { provide: CACHE_PROVIDER, useValue: mockCache },
      ],
    }).compile();
    useCase = module.get(DeleteCategoryUseCase);
    jest.clearAllMocks();
    mockCache.del.mockResolvedValue(null);
    mockRepo.deactivate.mockResolvedValue(undefined);
  });

  it('deactivates category and invalidates cache', async () => {
    mockRepo.findById.mockResolvedValue(category);
    await useCase.execute({ id: 'cat-1' });
    expect(mockRepo.deactivate).toHaveBeenCalledWith('cat-1');
    expect(mockCache.del).toHaveBeenCalled();
  });

  it('throws notFound when category does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'unknown' })).rejects.toThrow();
    expect(mockRepo.deactivate).not.toHaveBeenCalled();
  });
});
