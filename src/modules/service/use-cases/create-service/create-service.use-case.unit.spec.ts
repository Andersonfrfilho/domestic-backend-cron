import { CATEGORY_REPOSITORY_PROVIDE } from '@modules/category/category.token';
import { Test } from '@nestjs/testing';

import { SERVICE_REPOSITORY_PROVIDE } from '../../service.token';
import { CreateServiceUseCase } from './create-service.use-case';

const mockServiceRepo = { create: jest.fn() };
const mockCategoryRepo = { findById: jest.fn() };

const category = { id: 'cat-1', name: 'Limpeza' };
const service = { id: 'svc-1', categoryId: 'cat-1', name: 'Faxina' };

describe('CreateServiceUseCase', () => {
  let useCase: CreateServiceUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CreateServiceUseCase,
        { provide: SERVICE_REPOSITORY_PROVIDE, useValue: mockServiceRepo },
        { provide: CATEGORY_REPOSITORY_PROVIDE, useValue: mockCategoryRepo },
      ],
    }).compile();
    useCase = module.get(CreateServiceUseCase);
    jest.clearAllMocks();
  });

  it('creates service when category exists', async () => {
    mockCategoryRepo.findById.mockResolvedValue(category);
    mockServiceRepo.create.mockResolvedValue(service);

    const result = await useCase.execute({ categoryId: 'cat-1', name: 'Faxina' });

    expect(result).toEqual(service);
    expect(mockCategoryRepo.findById).toHaveBeenCalledWith('cat-1');
  });

  it('throws when category does not exist', async () => {
    mockCategoryRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ categoryId: 'unknown', name: 'Faxina' })).rejects.toThrow();
    expect(mockServiceRepo.create).not.toHaveBeenCalled();
  });
});
