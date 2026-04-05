import { Test } from '@nestjs/testing';

import { DOCUMENT_REPOSITORY_PROVIDE } from '../../document.token';
import { RejectDocumentUseCase } from './reject-document.use-case';

const mockRepo = { findById: jest.fn(), updateStatus: jest.fn() };

const pendingDoc = { id: 'doc-1', userId: 'user-1', status: 'PENDING', type: 'ID' };

describe('RejectDocumentUseCase', () => {
  let useCase: RejectDocumentUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RejectDocumentUseCase,
        { provide: DOCUMENT_REPOSITORY_PROVIDE, useValue: mockRepo },
      ],
    }).compile();
    useCase = module.get(RejectDocumentUseCase);
    jest.clearAllMocks();
  });

  it('rejects a PENDING document', async () => {
    mockRepo.findById.mockResolvedValue(pendingDoc);
    mockRepo.updateStatus.mockResolvedValue({ ...pendingDoc, status: 'REJECTED', reviewedAt: new Date() });

    const result = await useCase.execute({ id: 'doc-1' });

    expect(result.status).toBe('REJECTED');
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('doc-1', 'REJECTED', expect.any(Date));
  });

  it('throws when document not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'doc-1' })).rejects.toThrow();
  });

  it('throws when document is not PENDING', async () => {
    mockRepo.findById.mockResolvedValue({ ...pendingDoc, status: 'REJECTED' });
    await expect(useCase.execute({ id: 'doc-1' })).rejects.toThrow();
  });
});
