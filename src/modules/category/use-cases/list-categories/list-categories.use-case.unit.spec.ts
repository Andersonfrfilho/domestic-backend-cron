import { CACHE_PROVIDER } from '@adatechnology/cache';
import { Test } from '@nestjs/testing';

import { CATEGORY_REPOSITORY_PROVIDE } from '../../category.token';
import { ListCategoriesUseCase } from './list-categories.use-case';

const mockRepo = { listActive: jest.fn() };
const mockCache = { get: jest.fn(), set: jest.fn() };

const categories = [{ id: 'cat-1', name: 'Limpeza', slug: 'limpeza', isActive: true }];

describe('ListCategoriesUseCase', () => {
  let useCase: ListCategoriesUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ListCategoriesUseCase,
        { provide: CATEGORY_REPOSITORY_PROVIDE, useValue: mockRepo },
        { provide: CACHE_PROVIDER, useValue: mockCache },
      ],
    }).compile();
    useCase = module.get(ListCategoriesUseCase);
    jest.clearAllMocks();
    mockCache.set.mockResolvedValue(null);
  });

  it('returns cached result when available', async () => {
    mockCache.get.mockResolvedValue(categories);

    const result = await useCase.execute();

    expect(result).toEqual(categories);
    expect(mockRepo.listActive).not.toHaveBeenCalled();
  });

  it('fetches from db and caches when cache is empty', async () => {
    mockCache.get.mockResolvedValue(null);
    mockRepo.listActive.mockResolvedValue(categories);

    const result = await useCase.execute();

    expect(result).toEqual(categories);
    expect(mockRepo.listActive).toHaveBeenCalled();
    expect(mockCache.set).toHaveBeenCalledWith('api:categories', categories, 300);
  });
});
