import { Test } from '@nestjs/testing';

import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '@modules/service-request/service-request.token';

import { REVIEW_REPOSITORY_PROVIDE } from '../../review.token';
import { CreateReviewUseCase } from './create-review.use-case';

const mockReviewRepo = { findByServiceRequestId: jest.fn(), create: jest.fn() };
const mockSrRepo = { findById: jest.fn() };

const completedSr = { id: 'sr-1', contractorId: 'user-1', providerId: 'prov-1', status: 'COMPLETED' };

describe('CreateReviewUseCase', () => {
  let useCase: CreateReviewUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CreateReviewUseCase,
        { provide: REVIEW_REPOSITORY_PROVIDE, useValue: mockReviewRepo },
        { provide: SERVICE_REQUEST_REPOSITORY_PROVIDE, useValue: mockSrRepo },
      ],
    }).compile();
    useCase = module.get(CreateReviewUseCase);
    jest.clearAllMocks();
  });

  it('creates review for completed service request', async () => {
    mockSrRepo.findById.mockResolvedValue(completedSr);
    mockReviewRepo.findByServiceRequestId.mockResolvedValue(null);
    mockReviewRepo.create.mockResolvedValue({
      id: 'rev-1',
      serviceRequestId: 'sr-1',
      contractorId: 'user-1',
      providerId: 'prov-1',
      rating: 5,
      comment: 'Great!',
    });

    const result = await useCase.execute({
      serviceRequestId: 'sr-1',
      contractorId: 'user-1',
      rating: 5,
      comment: 'Great!',
    });

    expect(result.id).toBe('rev-1');
    expect(mockReviewRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ providerId: 'prov-1', rating: 5 }),
    );
  });

  it('throws when service request is not COMPLETED', async () => {
    mockSrRepo.findById.mockResolvedValue({ ...completedSr, status: 'ACCEPTED' });
    await expect(
      useCase.execute({ serviceRequestId: 'sr-1', contractorId: 'user-1', rating: 5 }),
    ).rejects.toThrow();
  });

  it('throws when service request not found', async () => {
    mockSrRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({ serviceRequestId: 'sr-1', contractorId: 'user-1', rating: 5 }),
    ).rejects.toThrow();
  });

  it('throws when review already exists', async () => {
    mockSrRepo.findById.mockResolvedValue(completedSr);
    mockReviewRepo.findByServiceRequestId.mockResolvedValue({ id: 'existing-rev' });
    await expect(
      useCase.execute({ serviceRequestId: 'sr-1', contractorId: 'user-1', rating: 4 }),
    ).rejects.toThrow();
  });
});
