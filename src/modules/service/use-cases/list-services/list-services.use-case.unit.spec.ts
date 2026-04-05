import { Test } from '@nestjs/testing';

import { SERVICE_REPOSITORY_PROVIDE } from '../../service.token';
import { ListServicesUseCase } from './list-services.use-case';

const mockRepo = { list: jest.fn(), findByCategory: jest.fn() };

const services = [
  { id: 'svc-1', categoryId: 'cat-1', name: 'Faxina' },
  { id: 'svc-2', categoryId: 'cat-2', name: 'Encanamento' },
];

describe('ListServicesUseCase', () => {
  let useCase: ListServicesUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ListServicesUseCase,
        { provide: SERVICE_REPOSITORY_PROVIDE, useValue: mockRepo },
      ],
    }).compile();
    useCase = module.get(ListServicesUseCase);
    jest.clearAllMocks();
  });

  it('lists all services when no categoryId provided', async () => {
    mockRepo.list.mockResolvedValue(services);

    const result = await useCase.execute({});

    expect(result).toEqual(services);
    expect(mockRepo.list).toHaveBeenCalled();
    expect(mockRepo.findByCategory).not.toHaveBeenCalled();
  });

  it('filters by category when categoryId provided', async () => {
    const filtered = services.filter((s) => s.categoryId === 'cat-1');
    mockRepo.findByCategory.mockResolvedValue(filtered);

    const result = await useCase.execute({ categoryId: 'cat-1' });

    expect(result).toEqual(filtered);
    expect(mockRepo.findByCategory).toHaveBeenCalledWith('cat-1');
    expect(mockRepo.list).not.toHaveBeenCalled();
  });
});
