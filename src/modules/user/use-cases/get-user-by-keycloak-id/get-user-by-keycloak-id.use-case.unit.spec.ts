import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';
import { Test } from '@nestjs/testing';

import { GetUserByKeycloakIdUseCase } from './get-user-by-keycloak-id.use-case';

const mockUser = { id: 'uuid-1', fullName: 'Anderson', keycloakId: 'kc-1', status: 'ACTIVE', createdAt: new Date() };
const mockUserRepository = { findByKeycloakId: jest.fn() };

describe('GetUserByKeycloakIdUseCase', () => {
  let useCase: GetUserByKeycloakIdUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GetUserByKeycloakIdUseCase,
        { provide: USER_REPOSITORY_PROVIDE, useValue: mockUserRepository },
      ],
    }).compile();
    useCase = module.get(GetUserByKeycloakIdUseCase);
    jest.clearAllMocks();
  });

  it('returns user when found by keycloakId', async () => {
    mockUserRepository.findByKeycloakId.mockResolvedValue(mockUser);
    const result = await useCase.execute({ keycloakId: 'kc-1' });
    expect(result).toEqual(mockUser);
    expect(mockUserRepository.findByKeycloakId).toHaveBeenCalledWith('kc-1');
  });

  it('throws notFound when keycloakId does not exist', async () => {
    mockUserRepository.findByKeycloakId.mockResolvedValue(null);
    await expect(useCase.execute({ keycloakId: 'unknown' })).rejects.toThrow();
  });
});
