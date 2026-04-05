import { Test } from '@nestjs/testing';

import { PROVIDER_REPOSITORY_PROVIDE } from '@modules/provider/provider.token';
import { QUEUE_PRODUCER_PROVIDER } from '@modules/shared/providers/queue/producer/producer.token';

import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';
import { CreateServiceRequestUseCase } from './create-service-request.use-case';

const mockSrRepo = { create: jest.fn() };
const mockProviderRepo = { getLatestVerification: jest.fn() };
const mockProducer = { send: jest.fn().mockResolvedValue({ success: true }) };

const sr = { id: 'sr-1', contractorId: 'user-1', providerId: 'prov-1', serviceId: 'svc-1', status: 'PENDING' };

describe('CreateServiceRequestUseCase', () => {
  let useCase: CreateServiceRequestUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CreateServiceRequestUseCase,
        { provide: SERVICE_REQUEST_REPOSITORY_PROVIDE, useValue: mockSrRepo },
        { provide: PROVIDER_REPOSITORY_PROVIDE, useValue: mockProviderRepo },
        { provide: QUEUE_PRODUCER_PROVIDER, useValue: mockProducer },
      ],
    }).compile();
    useCase = module.get(CreateServiceRequestUseCase);
    jest.clearAllMocks();
    mockProducer.send.mockResolvedValue({ success: true });
  });

  const params = { contractorId: 'user-1', providerId: 'prov-1', serviceId: 'svc-1', addressId: 'addr-1' };

  it('creates request when provider is APPROVED and publishes event', async () => {
    mockProviderRepo.getLatestVerification.mockResolvedValue({ status: 'APPROVED' });
    mockSrRepo.create.mockResolvedValue(sr);

    const result = await useCase.execute(params);

    expect(result).toEqual(sr);
    expect(mockProducer.send).toHaveBeenCalled();
  });

  it('throws when provider is not APPROVED', async () => {
    mockProviderRepo.getLatestVerification.mockResolvedValue({ status: 'UNDER_REVIEW' });

    await expect(useCase.execute(params)).rejects.toThrow();
    expect(mockSrRepo.create).not.toHaveBeenCalled();
  });

  it('throws when provider has no verification', async () => {
    mockProviderRepo.getLatestVerification.mockResolvedValue(null);

    await expect(useCase.execute(params)).rejects.toThrow();
  });
});
