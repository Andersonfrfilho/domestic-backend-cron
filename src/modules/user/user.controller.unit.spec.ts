import { UserController } from './user.controller';

const mockUser = {
  id: 'user-1',
  keycloakId: 'kc-1',
  fullName: 'Anderson Silva',
  status: 'ACTIVE',
  createdAt: new Date('2024-01-01'),
};

const mockUserService = {
  createUser: jest.fn(),
  getUserById: jest.fn(),
  getUserByKeycloakId: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
};

const mockCacheProvider = {
  del: jest.fn().mockResolvedValue(undefined),
};

describe('UserController', () => {
  let controller: UserController;

  beforeEach(() => {
    controller = new UserController(mockUserService as any, mockCacheProvider as any);
    jest.clearAllMocks();
    mockCacheProvider.del.mockResolvedValue(undefined);
  });

  describe('POST /users — create', () => {
    it('creates user and invalidates cache', async () => {
      mockUserService.createUser.mockResolvedValue(mockUser);

      const result = await controller.create({ fullName: 'Anderson Silva' } as any);

      expect(mockUserService.createUser).toHaveBeenCalledWith({ fullName: 'Anderson Silva' });
      expect(mockCacheProvider.del).toHaveBeenCalledWith('users:list');
      expect(result).toEqual(mockUser);
    });

    it('still returns user even if cache invalidation fails', async () => {
      mockUserService.createUser.mockResolvedValue(mockUser);
      mockCacheProvider.del.mockRejectedValue(new Error('redis down'));

      const result = await controller.create({ fullName: 'Test' } as any);

      expect(result).toEqual(mockUser);
    });

    it('propagates service errors', async () => {
      mockUserService.createUser.mockRejectedValue(new Error('conflict'));

      await expect(controller.create({ fullName: 'Test' } as any)).rejects.toThrow('conflict');
    });
  });

  describe('GET /users/me — getMe', () => {
    it('returns user by keycloakId from header', async () => {
      mockUserService.getUserByKeycloakId.mockResolvedValue(mockUser);

      const result = await controller.getMe('kc-1');

      expect(mockUserService.getUserByKeycloakId).toHaveBeenCalledWith('kc-1');
      expect(result).toEqual(mockUser);
    });

    it('propagates notFound from service', async () => {
      mockUserService.getUserByKeycloakId.mockRejectedValue(new Error('not found'));

      await expect(controller.getMe('unknown')).rejects.toThrow('not found');
    });
  });

  describe('GET /users/:id — findById', () => {
    it('returns user by internal id', async () => {
      mockUserService.getUserById.mockResolvedValue(mockUser);

      const result = await controller.findById('user-1');

      expect(mockUserService.getUserById).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('PUT /users/:id — update', () => {
    it('updates and returns updated user', async () => {
      const updated = { ...mockUser, fullName: 'Updated Name' };
      mockUserService.updateUser.mockResolvedValue(updated);

      const result = await controller.update('user-1', { fullName: 'Updated Name' } as any);

      expect(mockUserService.updateUser).toHaveBeenCalledWith('user-1', { fullName: 'Updated Name' });
      expect(result).toEqual(updated);
    });
  });

  describe('DELETE /users/:id — delete', () => {
    it('calls deleteUser and returns void', async () => {
      mockUserService.deleteUser.mockResolvedValue(undefined);

      await controller.delete('user-1');

      expect(mockUserService.deleteUser).toHaveBeenCalledWith('user-1');
    });
  });

  describe('controller initialization', () => {
    it('should have all required methods', () => {
      expect(typeof controller.create).toBe('function');
      expect(typeof controller.getMe).toBe('function');
      expect(typeof controller.findById).toBe('function');
      expect(typeof controller.update).toBe('function');
      expect(typeof controller.delete).toBe('function');
    });
  });
});
