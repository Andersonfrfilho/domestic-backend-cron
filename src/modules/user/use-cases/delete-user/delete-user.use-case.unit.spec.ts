import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';
import { Test } from '@nestjs/testing';

import { DeleteUserUseCase } from './delete-user.use-case';

const mockUser = { id: 'uuid-1', fullName: 'Anderson', keycloakId: 'kc-1', status: 'ACTIVE', createdAt: new Date() };
const mockUserRepository = { findById: jest.fn(), update: jest.fn() };

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        { provide: USER_REPOSITORY_PROVIDE, useValue: mockUserRepository },
      ],
    }).compile();
    useCase = module.get(DeleteUserUseCase);
    jest.clearAllMocks();
  });

  it('soft deletes user by setting status to DELETED', async () => {
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockUserRepository.update.mockResolvedValue(undefined);

    await useCase.execute({ id: 'uuid-1' });
    expect(mockUserRepository.update).toHaveBeenCalledWith('uuid-1', { status: 'DELETED' });
  });

  it('throws notFound when user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'unknown' })).rejects.toThrow();
    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });
});
