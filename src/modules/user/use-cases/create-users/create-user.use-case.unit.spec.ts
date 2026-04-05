import { faker } from '@faker-js/faker';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UserApplicationCreateUseCase } from './create-user.use-case';
import { UserErrorFactory } from '../factories/user.error.factory';

describe('UserApplicationCreateUseCase - Unit Tests', () => {
  let useCase: UserApplicationCreateUseCase;
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      findByKeycloakId: jest.fn(),
      create: jest.fn(),
    };

    useCase = new UserApplicationCreateUseCase(mockUserRepository);
  });

  describe('execute', () => {
    it('should be defined', () => {
      expect(useCase).toBeDefined();
      expect(useCase.execute).toBeDefined();
    });

    it('should throw error when keycloakId already exists', async () => {
      const params = {
        fullName: 'John Doe',
        keycloakId: 'keycloak-123',
        status: 'PENDING',
      };

      mockUserRepository.findByKeycloakId.mockResolvedValue({ id: 'user-1', keycloakId: params.keycloakId });

      await expect(useCase.execute(params)).rejects.toThrow();
      expect(mockUserRepository.findByKeycloakId).toHaveBeenCalledWith(params.keycloakId);
    });

    it('should successfully create user', async () => {
      const params = {
        fullName: 'John Doe',
        keycloakId: 'keycloak-123',
        status: 'PENDING',
      };

      const userId = faker.string.uuid();

      mockUserRepository.findByKeycloakId.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: userId,
        ...params,
      });

      const result = await useCase.execute(params);

      // result.id type might complain depending on interface, we just ignore standard ts errors if tests pass
      expect((result as any).id).toBe(userId);
      expect(mockUserRepository.create).toHaveBeenCalledWith(params);
    });

    it('should successfully create user when keycloakId is not provided', async () => {
      const params = {
        fullName: 'John Doe',
        status: 'PENDING',
      };

      const userId = faker.string.uuid();

      mockUserRepository.create.mockResolvedValue({
        id: userId,
        ...params,
      });

      const result = await useCase.execute(params);

      expect((result as any).id).toBe(userId);
      expect(mockUserRepository.findByKeycloakId).not.toHaveBeenCalled();
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        fullName: params.fullName,
        keycloakId: undefined,
        status: params.status,
      });
    });
  });
});
