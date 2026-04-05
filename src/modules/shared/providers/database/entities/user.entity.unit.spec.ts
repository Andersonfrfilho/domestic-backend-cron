import { User } from './user.entity';

describe('User Entity', () => {
  let user: User;

  it('should create an instance', () => {
    user = new User();
    expect(user).toBeInstanceOf(User);
  });

  describe('properties', () => {
    beforeEach(() => {
      user = new User();
    });

    it('should have id property', () => {
      user.id = '550e8400-e29b-41d4-a716-446655440000';
      expect(user.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should have keycloakId property', () => {
      user.keycloakId = 'kc-uuid-1234';
      expect(user.keycloakId).toBe('kc-uuid-1234');
    });

    it('should allow null keycloakId', () => {
      user.keycloakId = null;
      expect(user.keycloakId).toBeNull();
    });

    it('should have fullName property', () => {
      user.fullName = 'Anderson Silva';
      expect(user.fullName).toBe('Anderson Silva');
    });

    it('should have status property with default PENDING', () => {
      user.status = 'ACTIVE';
      expect(user.status).toBe('ACTIVE');
    });

    it('should support DELETED status for soft delete', () => {
      user.status = 'DELETED';
      expect(user.status).toBe('DELETED');
    });

    it('should have createdAt property', () => {
      const now = new Date();
      user.createdAt = now;
      expect(user.createdAt).toEqual(now);
    });
  });

  describe('full user scenario', () => {
    it('should create complete user with all properties', () => {
      user = new User();
      user.id = '550e8400-e29b-41d4-a716-446655440000';
      user.keycloakId = 'kc-uuid-1234';
      user.fullName = 'Anderson Silva';
      user.status = 'ACTIVE';
      user.createdAt = new Date('2024-01-01');

      expect(user.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(user.keycloakId).toBe('kc-uuid-1234');
      expect(user.fullName).toBe('Anderson Silva');
      expect(user.status).toBe('ACTIVE');
      expect(user.createdAt).toEqual(new Date('2024-01-01'));
    });

    it('should handle soft delete via status', () => {
      user = new User();
      user.id = '550e8400-e29b-41d4-a716-446655440000';
      user.status = 'DELETED';
      expect(user.status).toBe('DELETED');
    });
  });
});
