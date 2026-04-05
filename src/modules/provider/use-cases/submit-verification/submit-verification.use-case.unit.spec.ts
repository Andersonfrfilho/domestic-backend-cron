import { Test } from '@nestjs/testing';

import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';
import { SubmitVerificationUseCase } from './submit-verification.use-case';

const mockRepo = {
  findById: jest.fn(),
  getLatestVerification: jest.fn(),
  updateVerification: jest.fn(),
};

const provider = { id: 'prov-1', userId: 'user-1' };

describe('SubmitVerificationUseCase', () => {
  let useCase: SubmitVerificationUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SubmitVerificationUseCase,
        { provide: PROVIDER_REPOSITORY_PROVIDE, useValue: mockRepo },
      ],
    }).compile();
    useCase = module.get(SubmitVerificationUseCase);
    jest.clearAllMocks();
  });

  it('transitions PENDING → UNDER_REVIEW', async () => {
    mockRepo.findById.mockResolvedValue(provider);
    mockRepo.getLatestVerification.mockResolvedValue({ id: 'ver-1', status: 'PENDING' });
    mockRepo.updateVerification.mockResolvedValue({ id: 'ver-1', status: 'UNDER_REVIEW' });

    const result = await useCase.execute({ providerId: 'prov-1' });

    expect(result.status).toBe('UNDER_REVIEW');
    expect(mockRepo.updateVerification).toHaveBeenCalledWith('ver-1', { status: 'UNDER_REVIEW' });
  });

  it('throws when verification status is not PENDING', async () => {
    mockRepo.findById.mockResolvedValue(provider);
    mockRepo.getLatestVerification.mockResolvedValue({ id: 'ver-1', status: 'UNDER_REVIEW' });

    await expect(useCase.execute({ providerId: 'prov-1' })).rejects.toThrow();
  });

  it('throws when provider not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ providerId: 'unknown' })).rejects.toThrow();
  });
});
