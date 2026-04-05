import { Test } from '@nestjs/testing';

import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';
import { CreateProviderUseCase } from './create-provider.use-case';

const mockRepo = {
  findByUserId: jest.fn(),
  create: jest.fn(),
  createVerification: jest.fn(),
};

const provider = { id: 'prov-1', userId: 'user-1', businessName: 'Minha Empresa' };

describe('CreateProviderUseCase', () => {
  let useCase: CreateProviderUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CreateProviderUseCase,
        { provide: PROVIDER_REPOSITORY_PROVIDE, useValue: mockRepo },
      ],
    }).compile();
    useCase = module.get(CreateProviderUseCase);
    jest.clearAllMocks();
    mockRepo.createVerification.mockResolvedValue({ id: 'ver-1', status: 'PENDING' });
  });

  it('creates provider and initial verification', async () => {
    mockRepo.findByUserId.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue(provider);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result).toEqual(provider);
    expect(mockRepo.createVerification).toHaveBeenCalledWith({ providerId: 'prov-1', status: 'PENDING' });
  });

  it('throws conflict when provider already exists for user', async () => {
    mockRepo.findByUserId.mockResolvedValue(provider);
    await expect(useCase.execute({ userId: 'user-1' })).rejects.toThrow();
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
