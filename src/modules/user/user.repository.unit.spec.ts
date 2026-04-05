import { faker } from '@faker-js/faker';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UserRepository } from './user.repository';

describe('UserRepository - Unit Tests', () => {
  let repository: UserRepository;
  let mockTypeormRepo: any;

  beforeEach(() => {
    mockTypeormRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    repository = new UserRepository(mockTypeormRepo);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        fullName: 'John Doe',
        keycloakId: faker.string.uuid(),
        status: 'PENDING',
      };

      const createdUser = { id: faker.string.uuid(), ...userData };

      mockTypeormRepo.create.mockReturnValue(userData);
      mockTypeormRepo.save.mockResolvedValue(createdUser);

      // Using 'any' as cast because we don't know CreateUserParams but tests are simple
      const result = await repository.create(userData as any);

      expect(result).toEqual(createdUser);
      expect(mockTypeormRepo.create).toHaveBeenCalledWith(userData);
      expect(mockTypeormRepo.save).toHaveBeenCalledWith(userData);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const userId = faker.string.uuid();
      const user = {
        id: userId,
        fullName: 'John Doe',
        keycloakId: faker.string.uuid(),
        status: 'PENDING',
      };

      mockTypeormRepo.findOne.mockResolvedValue(user);

      const result = await repository.findById(userId);

      expect(result).toEqual(user);
      expect(mockTypeormRepo.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should return null when user not found', async () => {
      mockTypeormRepo.findOne.mockResolvedValue(null);

      const result = await repository.findById(faker.string.uuid());

      expect(result).toBeNull();
    });
  });

  describe('findByKeycloakId', () => {
    it('should find user by keycloakId', async () => {
      const keycloakId = faker.string.uuid();
      const user = {
        id: faker.string.uuid(),
        fullName: 'John Doe',
        keycloakId,
        status: 'PENDING',
      };

      mockTypeormRepo.findOne.mockResolvedValue(user);

      const result = await repository.findByKeycloakId(keycloakId);

      expect(result).toEqual(user);
      expect(mockTypeormRepo.findOne).toHaveBeenCalledWith({
        where: { keycloakId },
      });
    });

    it('should return null when user keycloakId not found', async () => {
      mockTypeormRepo.findOne.mockResolvedValue(null);

      const result = await repository.findByKeycloakId(faker.string.uuid());

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const userId = faker.string.uuid();
      const updateData = { fullName: 'Jane Doe', status: 'ACTIVE' };
      const updatedUser = {
        id: userId,
        fullName: 'Jane Doe',
        keycloakId: faker.string.uuid(),
        status: 'ACTIVE',
      };

      mockTypeormRepo.update.mockResolvedValue({ affected: 1 });
      mockTypeormRepo.findOne.mockResolvedValue(updatedUser);

      const result = await repository.update(userId, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockTypeormRepo.update).toHaveBeenCalledWith(userId, updateData);
    });

    it('should throw error when user not found during update', async () => {
      const userId = faker.string.uuid();
      mockTypeormRepo.update.mockResolvedValue({ affected: 0 });
      mockTypeormRepo.findOne.mockResolvedValue(null);

      await expect(repository.update(userId, { fullName: 'Jane Doe' })).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      const userId = faker.string.uuid();
      mockTypeormRepo.delete.mockResolvedValue({ affected: 1 });

      await repository.delete(userId);

      expect(mockTypeormRepo.delete).toHaveBeenCalledWith(userId);
    });
  });
});
