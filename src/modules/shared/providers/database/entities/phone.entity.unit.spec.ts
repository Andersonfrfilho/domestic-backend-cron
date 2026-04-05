import { Phone } from './phone.entity';

describe('Phone Entity', () => {
  let phone: Phone;

  it('should create an instance', () => {
    phone = new Phone();
    expect(phone).toBeInstanceOf(Phone);
  });

  describe('properties', () => {
    beforeEach(() => {
      phone = new Phone();
    });

    it('should have id property', () => {
      phone.id = '550e8400-e29b-41d4-a716-446655440000';
      expect(phone.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should have number property', () => {
      phone.number = '+5511987654321';
      expect(phone.number).toBe('+5511987654321');
    });

    it('should have type property', () => {
      phone.type = 'MOBILE';
      expect(phone.type).toBe('MOBILE');
    });

    it('should support LANDLINE type', () => {
      phone.type = 'LANDLINE';
      expect(phone.type).toBe('LANDLINE');
    });

    it('should support WHATSAPP type', () => {
      phone.type = 'WHATSAPP';
      expect(phone.type).toBe('WHATSAPP');
    });

    it('should have isVerified property', () => {
      phone.isVerified = true;
      expect(phone.isVerified).toBe(true);
    });

    it('should have createdAt property', () => {
      const now = new Date();
      phone.createdAt = now;
      expect(phone.createdAt).toEqual(now);
    });
  });

  describe('full scenario', () => {
    it('should create complete phone with all properties', () => {
      phone = new Phone();
      phone.id = '550e8400-e29b-41d4-a716-446655440000';
      phone.number = '+5511987654321';
      phone.type = 'MOBILE';
      phone.isVerified = false;
      phone.createdAt = new Date('2024-01-01');

      expect(phone.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(phone.number).toBe('+5511987654321');
      expect(phone.type).toBe('MOBILE');
      expect(phone.isVerified).toBe(false);
      expect(phone.createdAt).toEqual(new Date('2024-01-01'));
    });
  });
});
