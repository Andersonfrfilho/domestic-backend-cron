import { UserErrorFactory } from '@modules/user/factories';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';
import { Test } from '@nestjs/testing';

import { GetUserByIdUseCase } from './get-user-by-id.use-case';

const mockUser = { id: 'uuid-1', fullName: 'Anderson', keycloakId: 'kc-1', status: 'ACTIVE', createdAt: new Date() };

const mockUserRepository = { findById: jest.fn() };

describe('GetUserByIdUseCase', () => {
  let useCase: GetUserByIdUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GetUserByIdUseCase,
        { provide: USER_REPOSITORY_PROVIDE, useValue: mockUserRepository },
      ],
    }).compile();
    useCase = module.get(GetUserByIdUseCase);
    jest.clearAllMocks();
  });

  it('returns user when found', async () => {
    mockUserRepository.findById.mockResolvedValue(mockUser);
    const result = await useCase.execute({ id: 'uuid-1' });
    expect(result).toEqual(mockUser);
    expect(mockUserRepository.findById).toHaveBeenCalledWith('uuid-1');
  });

  it('throws notFound when user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'unknown' })).rejects.toThrow();
    expect(mockUserRepository.findById).toHaveBeenCalledWith('unknown');
  });
});
