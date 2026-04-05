import { Test } from '@nestjs/testing';

import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';
import { RejectServiceRequestUseCase } from './reject-service-request.use-case';

const mockRepo = { findById: jest.fn(), updateStatus: jest.fn() };

const pendingSr = { id: 'sr-1', contractorId: 'user-1', providerId: 'prov-1', serviceId: 'svc-1', status: 'PENDING' };

describe('RejectServiceRequestUseCase', () => {
  let useCase: RejectServiceRequestUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RejectServiceRequestUseCase,
        { provide: SERVICE_REQUEST_REPOSITORY_PROVIDE, useValue: mockRepo },
      ],
    }).compile();
    useCase = module.get(RejectServiceRequestUseCase);
    jest.clearAllMocks();
  });

  it('rejects PENDING request', async () => {
    mockRepo.findById.mockResolvedValue(pendingSr);
    mockRepo.updateStatus.mockResolvedValue({ ...pendingSr, status: 'REJECTED' });

    const result = await useCase.execute({ id: 'sr-1', providerId: 'prov-1' });

    expect(result.status).toBe('REJECTED');
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('sr-1', 'REJECTED');
  });

  it('throws when provider is not the target', async () => {
    mockRepo.findById.mockResolvedValue(pendingSr);
    await expect(useCase.execute({ id: 'sr-1', providerId: 'other-prov' })).rejects.toThrow();
  });

  it('throws when status is not PENDING', async () => {
    mockRepo.findById.mockResolvedValue({ ...pendingSr, status: 'ACCEPTED' });
    await expect(useCase.execute({ id: 'sr-1', providerId: 'prov-1' })).rejects.toThrow();
  });

  it('throws when not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'sr-1', providerId: 'prov-1' })).rejects.toThrow();
  });
});
