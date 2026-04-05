import { Test } from '@nestjs/testing';

import { ADDRESS_REPOSITORY_PROVIDE, USER_ADDRESS_REPOSITORY_PROVIDE, USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';

import { AddUserAddressUseCase } from './add-user-address.use-case';

const mockUser = { id: 'user-1', fullName: 'Anderson', status: 'ACTIVE' };
const mockAddress = { id: 'addr-1', street: 'Rua das Flores', city: 'Fortaleza', state: 'CE', zipCode: '60010-000' };
const mockUserAddress = { id: 'ua-1', userId: 'user-1', addressId: 'addr-1', isPrimary: false, label: null };

const mockUserRepository = { findById: jest.fn() };
const mockAddressRepository = { createAddress: jest.fn() };
const mockUserAddressRepository = { linkUserToAddress: jest.fn() };

describe('AddUserAddressUseCase', () => {
  let useCase: AddUserAddressUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AddUserAddressUseCase,
        { provide: USER_REPOSITORY_PROVIDE, useValue: mockUserRepository },
        { provide: ADDRESS_REPOSITORY_PROVIDE, useValue: mockAddressRepository },
        { provide: USER_ADDRESS_REPOSITORY_PROVIDE, useValue: mockUserAddressRepository },
      ],
    }).compile();
    useCase = module.get(AddUserAddressUseCase);
    jest.clearAllMocks();
  });

  const baseParams = {
    userId: 'user-1',
    street: 'Rua das Flores',
    number: '123',
    neighborhood: 'Centro',
    city: 'Fortaleza',
    state: 'CE',
    zipCode: '60010-000',
  };

  it('creates address and links to user', async () => {
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockAddressRepository.createAddress.mockResolvedValue(mockAddress);
    mockUserAddressRepository.linkUserToAddress.mockResolvedValue(mockUserAddress);

    const result = await useCase.execute(baseParams);

    expect(mockUserRepository.findById).toHaveBeenCalledWith('user-1');
    expect(mockAddressRepository.createAddress).toHaveBeenCalledWith(expect.objectContaining({
      street: 'Rua das Flores',
      city: 'Fortaleza',
      zipCode: '60010-000',
      isVerified: false,
    }));
    expect(mockUserAddressRepository.linkUserToAddress).toHaveBeenCalledWith('user-1', 'addr-1', undefined, false);
    expect(result).toEqual(mockUserAddress);
  });

  it('passes label and isPrimary to linkUserToAddress', async () => {
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockAddressRepository.createAddress.mockResolvedValue(mockAddress);
    mockUserAddressRepository.linkUserToAddress.mockResolvedValue(mockUserAddress);

    await useCase.execute({ ...baseParams, label: 'Casa', isPrimary: true });

    expect(mockUserAddressRepository.linkUserToAddress).toHaveBeenCalledWith('user-1', 'addr-1', 'Casa', true);
  });

  it('throws notFound when user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(baseParams)).rejects.toThrow();
    expect(mockAddressRepository.createAddress).not.toHaveBeenCalled();
  });
});
