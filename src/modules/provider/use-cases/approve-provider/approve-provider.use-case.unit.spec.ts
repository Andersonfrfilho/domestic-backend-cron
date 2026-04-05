import { Test } from '@nestjs/testing';

import { QUEUE_PRODUCER_PROVIDER } from '@modules/shared/providers/queue/producer/producer.token';

import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';
import { ApproveProviderUseCase } from './approve-provider.use-case';

const mockRepo = {
  findById: jest.fn(),
  getLatestVerification: jest.fn(),
  updateVerification: jest.fn(),
};
const mockProducer = { send: jest.fn().mockResolvedValue({ success: true }) };

const provider = { id: 'prov-1', userId: 'user-1' };

describe('ApproveProviderUseCase', () => {
  let useCase: ApproveProviderUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ApproveProviderUseCase,
        { provide: PROVIDER_REPOSITORY_PROVIDE, useValue: mockRepo },
        { provide: QUEUE_PRODUCER_PROVIDER, useValue: mockProducer },
      ],
    }).compile();
    useCase = module.get(ApproveProviderUseCase);
    jest.clearAllMocks();
    mockProducer.send.mockResolvedValue({ success: true });
  });

  it('approves provider and publishes event', async () => {
    mockRepo.findById.mockResolvedValue(provider);
    mockRepo.getLatestVerification.mockResolvedValue({ id: 'ver-1', status: 'UNDER_REVIEW' });
    mockRepo.updateVerification.mockResolvedValue({ id: 'ver-1', status: 'APPROVED' });

    const result = await useCase.execute({ providerId: 'prov-1', reviewedBy: 'admin-1' });

    expect(result.status).toBe('APPROVED');
    expect(mockProducer.send).toHaveBeenCalled();
  });

  it('throws when verification is not UNDER_REVIEW', async () => {
    mockRepo.findById.mockResolvedValue(provider);
    mockRepo.getLatestVerification.mockResolvedValue({ id: 'ver-1', status: 'PENDING' });

    await expect(useCase.execute({ providerId: 'prov-1', reviewedBy: 'admin-1' })).rejects.toThrow();
    expect(mockRepo.updateVerification).not.toHaveBeenCalled();
  });

  it('throws when provider not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ providerId: 'unknown', reviewedBy: 'admin-1' })).rejects.toThrow();
  });
});
