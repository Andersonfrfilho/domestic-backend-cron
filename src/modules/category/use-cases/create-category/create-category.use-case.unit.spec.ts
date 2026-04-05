import { CACHE_PROVIDER } from '@adatechnology/cache';
import { Test } from '@nestjs/testing';

import { CATEGORY_REPOSITORY_PROVIDE } from '../../category.token';
import { CreateCategoryUseCase } from './create-category.use-case';

const mockRepo = { findBySlug: jest.fn(), create: jest.fn() };
const mockCache = { del: jest.fn() };

const category = { id: 'cat-1', name: 'Limpeza', slug: 'limpeza', isActive: true };

describe('CreateCategoryUseCase', () => {
  let useCase: CreateCategoryUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CreateCategoryUseCase,
        { provide: CATEGORY_REPOSITORY_PROVIDE, useValue: mockRepo },
        { provide: CACHE_PROVIDER, useValue: mockCache },
      ],
    }).compile();
    useCase = module.get(CreateCategoryUseCase);
    jest.clearAllMocks();
    mockCache.del.mockResolvedValue(null);
  });

  it('creates category and invalidates cache', async () => {
    mockRepo.findBySlug.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue(category);

    const result = await useCase.execute({ name: 'Limpeza', slug: 'limpeza' });

    expect(result).toEqual(category);
    expect(mockCache.del).toHaveBeenCalledWith('api:categories');
  });

  it('throws conflict when slug already exists', async () => {
    mockRepo.findBySlug.mockResolvedValue(category);

    await expect(useCase.execute({ name: 'Limpeza', slug: 'limpeza' })).rejects.toThrow();
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
