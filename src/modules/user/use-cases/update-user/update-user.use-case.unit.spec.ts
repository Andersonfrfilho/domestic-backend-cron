import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';
import { Test } from '@nestjs/testing';

import { UpdateUserUseCase } from './update-user.use-case';

const mockUser = { id: 'uuid-1', fullName: 'Anderson', keycloakId: 'kc-1', status: 'ACTIVE', createdAt: new Date() };
const mockUserRepository = { findById: jest.fn(), update: jest.fn() };

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        { provide: USER_REPOSITORY_PROVIDE, useValue: mockUserRepository },
      ],
    }).compile();
    useCase = module.get(UpdateUserUseCase);
    jest.clearAllMocks();
  });

  it('updates and returns user', async () => {
    const updated = { ...mockUser, fullName: 'Anderson Updated' };
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockUserRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute({ id: 'uuid-1', fullName: 'Anderson Updated' });
    expect(result.fullName).toBe('Anderson Updated');
    expect(mockUserRepository.update).toHaveBeenCalledWith('uuid-1', { fullName: 'Anderson Updated', status: undefined });
  });

  it('throws notFound when user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'unknown', fullName: 'X' })).rejects.toThrow();
  });
});
