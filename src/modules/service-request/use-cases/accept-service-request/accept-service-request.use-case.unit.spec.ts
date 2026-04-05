import { Test } from '@nestjs/testing';

import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';
import { AcceptServiceRequestUseCase } from './accept-service-request.use-case';

const mockRepo = { findById: jest.fn(), updateStatus: jest.fn() };

const pendingSr = { id: 'sr-1', providerId: 'prov-1', contractorId: 'user-1', status: 'PENDING' };

describe('AcceptServiceRequestUseCase', () => {
  let useCase: AcceptServiceRequestUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AcceptServiceRequestUseCase,
        { provide: SERVICE_REQUEST_REPOSITORY_PROVIDE, useValue: mockRepo },
      ],
    }).compile();
    useCase = module.get(AcceptServiceRequestUseCase);
    jest.clearAllMocks();
  });

  it('accepts a PENDING request by the correct provider', async () => {
    mockRepo.findById.mockResolvedValue(pendingSr);
    mockRepo.updateStatus.mockResolvedValue({ ...pendingSr, status: 'ACCEPTED' });

    const result = await useCase.execute({ id: 'sr-1', providerId: 'prov-1' });

    expect(result.status).toBe('ACCEPTED');
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('sr-1', 'ACCEPTED');
  });

  it('throws when provider is not the owner', async () => {
    mockRepo.findById.mockResolvedValue(pendingSr);
    await expect(useCase.execute({ id: 'sr-1', providerId: 'other-prov' })).rejects.toThrow();
  });

  it('throws when status is not PENDING', async () => {
    mockRepo.findById.mockResolvedValue({ ...pendingSr, status: 'ACCEPTED' });
    await expect(useCase.execute({ id: 'sr-1', providerId: 'prov-1' })).rejects.toThrow();
  });

  it('throws when service request not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'unknown', providerId: 'prov-1' })).rejects.toThrow();
  });
});
