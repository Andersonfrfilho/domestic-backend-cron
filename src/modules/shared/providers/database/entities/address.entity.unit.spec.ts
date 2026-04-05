import { Address } from './address.entity';

describe('Address Entity', () => {
  let address: Address;

  it('should create an instance', () => {
    address = new Address();
    expect(address).toBeInstanceOf(Address);
  });

  describe('properties', () => {
    beforeEach(() => {
      address = new Address();
    });

    it('should have id property', () => {
      address.id = '550e8400-e29b-41d4-a716-446655440000';
      expect(address.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should have street property', () => {
      address.street = 'Rua das Flores';
      expect(address.street).toBe('Rua das Flores');
    });

    it('should have number property', () => {
      address.number = '123';
      expect(address.number).toBe('123');
    });

    it('should have complement property', () => {
      address.complement = 'Apto 45';
      expect(address.complement).toBe('Apto 45');
    });

    it('should allow null complement', () => {
      address.complement = null as any;
      expect(address.complement).toBeNull();
    });

    it('should have neighborhood property', () => {
      address.neighborhood = 'Centro';
      expect(address.neighborhood).toBe('Centro');
    });

    it('should have city property', () => {
      address.city = 'São Paulo';
      expect(address.city).toBe('São Paulo');
    });

    it('should have state property', () => {
      address.state = 'SP';
      expect(address.state).toBe('SP');
    });

    it('should have zipCode property', () => {
      address.zipCode = '01310-100';
      expect(address.zipCode).toBe('01310-100');
    });

    it('should have latitude property', () => {
      address.latitude = -23.5505;
      expect(address.latitude).toBe(-23.5505);
    });

    it('should have longitude property', () => {
      address.longitude = -46.6333;
      expect(address.longitude).toBe(-46.6333);
    });

    it('should have isVerified property', () => {
      address.isVerified = true;
      expect(address.isVerified).toBe(true);
    });

    it('should have createdAt property', () => {
      const now = new Date();
      address.createdAt = now;
      expect(address.createdAt).toEqual(now);
    });
  });

  describe('full address scenario', () => {
    it('should create complete address with all properties', () => {
      address = new Address();
      address.id = '550e8400-e29b-41d4-a716-446655440000';
      address.street = 'Avenida Paulista';
      address.number = '1000';
      address.complement = 'Sala 30';
      address.neighborhood = 'Bela Vista';
      address.city = 'São Paulo';
      address.state = 'SP';
      address.zipCode = '01311-100';
      address.latitude = -23.5613;
      address.longitude = -46.656;
      address.isVerified = false;
      address.createdAt = new Date('2024-01-01');

      expect(address.street).toBe('Avenida Paulista');
      expect(address.zipCode).toBe('01311-100');
      expect(address.latitude).toBe(-23.5613);
      expect(address.isVerified).toBe(false);
    });
  });

  describe('coordinates', () => {
    beforeEach(() => {
      address = new Address();
    });

    it('should accept null coordinates', () => {
      address.latitude = null as any;
      address.longitude = null as any;
      expect(address.latitude).toBeNull();
      expect(address.longitude).toBeNull();
    });

    it('should accept valid lat/lng values', () => {
      address.latitude = -23.5505;
      address.longitude = -46.6333;
      expect(address.latitude).toBe(-23.5505);
      expect(address.longitude).toBe(-46.6333);
    });
  });
});
