import { Test } from '@nestjs/testing';

import { CATEGORY_REPOSITORY_PROVIDE } from '../../category.token';
import { GetCategoryByIdUseCase } from './get-category-by-id.use-case';

const mockRepo = { findById: jest.fn() };
const category = { id: 'cat-1', name: 'Limpeza', slug: 'limpeza', isActive: true };

describe('GetCategoryByIdUseCase', () => {
  let useCase: GetCategoryByIdUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GetCategoryByIdUseCase,
        { provide: CATEGORY_REPOSITORY_PROVIDE, useValue: mockRepo },
      ],
    }).compile();
    useCase = module.get(GetCategoryByIdUseCase);
    jest.clearAllMocks();
  });

  it('returns category when found', async () => {
    mockRepo.findById.mockResolvedValue(category);
    expect(await useCase.execute({ id: 'cat-1' })).toEqual(category);
  });

  it('throws notFound when category does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'unknown' })).rejects.toThrow();
  });
});
