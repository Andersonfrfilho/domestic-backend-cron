import { Test } from '@nestjs/testing';

import { SERVICE_REPOSITORY_PROVIDE } from '../../service.token';
import { GetServiceByIdUseCase } from './get-service-by-id.use-case';

const mockRepo = { findById: jest.fn() };
const service = { id: 'svc-1', categoryId: 'cat-1', name: 'Faxina' };

describe('GetServiceByIdUseCase', () => {
  let useCase: GetServiceByIdUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GetServiceByIdUseCase,
        { provide: SERVICE_REPOSITORY_PROVIDE, useValue: mockRepo },
      ],
    }).compile();
    useCase = module.get(GetServiceByIdUseCase);
    jest.clearAllMocks();
  });

  it('returns service when found', async () => {
    mockRepo.findById.mockResolvedValue(service);
    expect(await useCase.execute({ id: 'svc-1' })).toEqual(service);
  });

  it('throws when service not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'unknown' })).rejects.toThrow();
  });
});
