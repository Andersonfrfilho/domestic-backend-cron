import { Test } from '@nestjs/testing';

import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';
import { CancelServiceRequestUseCase } from './cancel-service-request.use-case';

const mockRepo = { findById: jest.fn(), updateStatus: jest.fn() };

const pendingSr = { id: 'sr-1', contractorId: 'user-1', providerId: 'prov-1', serviceId: 'svc-1', status: 'PENDING' };

describe('CancelServiceRequestUseCase', () => {
  let useCase: CancelServiceRequestUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CancelServiceRequestUseCase,
        { provide: SERVICE_REQUEST_REPOSITORY_PROVIDE, useValue: mockRepo },
      ],
    }).compile();
    useCase = module.get(CancelServiceRequestUseCase);
    jest.clearAllMocks();
  });

  it('cancels PENDING request', async () => {
    mockRepo.findById.mockResolvedValue(pendingSr);
    mockRepo.updateStatus.mockResolvedValue({ ...pendingSr, status: 'CANCELLED' });

    const result = await useCase.execute({ id: 'sr-1', contractorId: 'user-1' });

    expect(result.status).toBe('CANCELLED');
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('sr-1', 'CANCELLED');
  });

  it('cancels ACCEPTED request', async () => {
    mockRepo.findById.mockResolvedValue({ ...pendingSr, status: 'ACCEPTED' });
    mockRepo.updateStatus.mockResolvedValue({ ...pendingSr, status: 'CANCELLED' });

    const result = await useCase.execute({ id: 'sr-1', contractorId: 'user-1' });

    expect(result.status).toBe('CANCELLED');
  });

  it('throws when contractor is not the owner', async () => {
    mockRepo.findById.mockResolvedValue(pendingSr);
    await expect(useCase.execute({ id: 'sr-1', contractorId: 'other-user' })).rejects.toThrow();
  });

  it('throws when status is COMPLETED', async () => {
    mockRepo.findById.mockResolvedValue({ ...pendingSr, status: 'COMPLETED' });
    await expect(useCase.execute({ id: 'sr-1', contractorId: 'user-1' })).rejects.toThrow();
  });

  it('throws when not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'sr-1', contractorId: 'user-1' })).rejects.toThrow();
  });
});
