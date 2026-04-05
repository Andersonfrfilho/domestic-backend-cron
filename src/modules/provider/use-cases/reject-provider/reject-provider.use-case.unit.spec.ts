import { Test } from '@nestjs/testing';

import { QUEUE_PRODUCER_PROVIDER } from '@modules/shared/providers/queue/producer/producer.token';

import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';
import { RejectProviderUseCase } from './reject-provider.use-case';

const mockRepo = {
  findById: jest.fn(),
  getLatestVerification: jest.fn(),
  updateVerification: jest.fn(),
};
const mockProducer = { send: jest.fn().mockResolvedValue({ success: true }) };

const provider = { id: 'prov-1', userId: 'user-1', status: 'UNDER_REVIEW' };
const verification = { id: 'verif-1', providerId: 'prov-1', status: 'UNDER_REVIEW' };

describe('RejectProviderUseCase', () => {
  let useCase: RejectProviderUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RejectProviderUseCase,
        { provide: PROVIDER_REPOSITORY_PROVIDE, useValue: mockRepo },
        { provide: QUEUE_PRODUCER_PROVIDER, useValue: mockProducer },
      ],
    }).compile();
    useCase = module.get(RejectProviderUseCase);
    jest.clearAllMocks();
    mockProducer.send.mockResolvedValue({ success: true });
  });

  it('rejects provider under review and publishes event', async () => {
    mockRepo.findById.mockResolvedValue(provider);
    mockRepo.getLatestVerification.mockResolvedValue(verification);
    mockRepo.updateVerification.mockResolvedValue({ ...verification, status: 'REJECTED', notes: 'Docs incomplete' });

    const result = await useCase.execute({
      providerId: 'prov-1',
      reviewedBy: 'admin-1',
      reason: 'Docs incomplete',
    });

    expect(result.status).toBe('REJECTED');
    expect(mockRepo.updateVerification).toHaveBeenCalledWith('verif-1', expect.objectContaining({ status: 'REJECTED' }));
    expect(mockProducer.send).toHaveBeenCalled();
  });

  it('throws when provider not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({ providerId: 'prov-1', reviewedBy: 'admin-1', reason: 'x' }),
    ).rejects.toThrow();
  });

  it('throws when no verification exists', async () => {
    mockRepo.findById.mockResolvedValue(provider);
    mockRepo.getLatestVerification.mockResolvedValue(null);
    await expect(
      useCase.execute({ providerId: 'prov-1', reviewedBy: 'admin-1', reason: 'x' }),
    ).rejects.toThrow();
  });

  it('throws when verification is not UNDER_REVIEW', async () => {
    mockRepo.findById.mockResolvedValue(provider);
    mockRepo.getLatestVerification.mockResolvedValue({ ...verification, status: 'APPROVED' });
    await expect(
      useCase.execute({ providerId: 'prov-1', reviewedBy: 'admin-1', reason: 'x' }),
    ).rejects.toThrow();
  });
});
