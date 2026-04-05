import { UserAddress } from './user-address.entity';

describe('UserAddress Entity', () => {
  let userAddress: UserAddress;

  it('should create an instance', () => {
    userAddress = new UserAddress();
    expect(userAddress).toBeInstanceOf(UserAddress);
  });

  describe('properties', () => {
    beforeEach(() => {
      userAddress = new UserAddress();
    });

    it('should have id property', () => {
      userAddress.id = '550e8400-e29b-41d4-a716-446655440000';
      expect(userAddress.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should have userId property', () => {
      userAddress.userId = '550e8400-e29b-41d4-a716-446655440001';
      expect(userAddress.userId).toBe('550e8400-e29b-41d4-a716-446655440001');
    });

    it('should have addressId property', () => {
      userAddress.addressId = '550e8400-e29b-41d4-a716-446655440002';
      expect(userAddress.addressId).toBe('550e8400-e29b-41d4-a716-446655440002');
    });

    it('should have label property', () => {
      userAddress.label = 'Casa';
      expect(userAddress.label).toBe('Casa');
    });

    it('should allow null label', () => {
      userAddress.label = null;
      expect(userAddress.label).toBeNull();
    });

    it('should have isPrimary property', () => {
      userAddress.isPrimary = true;
      expect(userAddress.isPrimary).toBe(true);
    });

    it('should have createdAt property', () => {
      const now = new Date();
      userAddress.createdAt = now;
      expect(userAddress.createdAt).toEqual(now);
    });
  });

  describe('full scenario', () => {
    it('should create complete user address', () => {
      userAddress = new UserAddress();
      userAddress.id = '550e8400-e29b-41d4-a716-446655440000';
      userAddress.userId = '550e8400-e29b-41d4-a716-446655440001';
      userAddress.addressId = '550e8400-e29b-41d4-a716-446655440002';
      userAddress.label = 'Casa';
      userAddress.isPrimary = true;
      userAddress.createdAt = new Date('2024-01-01');

      expect(userAddress.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(userAddress.userId).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(userAddress.addressId).toBe('550e8400-e29b-41d4-a716-446655440002');
      expect(userAddress.label).toBe('Casa');
      expect(userAddress.isPrimary).toBe(true);
    });

    it('should handle primary address selection', () => {
      userAddress = new UserAddress();
      userAddress.isPrimary = true;
      expect(userAddress.isPrimary).toBe(true);

      const secondary = new UserAddress();
      secondary.isPrimary = false;
      expect(secondary.isPrimary).toBe(false);
    });
  });
});
