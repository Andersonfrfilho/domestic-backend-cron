import { Test } from '@nestjs/testing';

import { USER_ADDRESS_REPOSITORY_PROVIDE, USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';

import { ListUserAddressesUseCase } from './list-user-addresses.use-case';

const mockUser = { id: 'user-1', fullName: 'Anderson', status: 'ACTIVE' };
const mockUserAddresses = [
  { id: 'ua-1', userId: 'user-1', addressId: 'addr-1', isPrimary: true, label: 'Casa' },
  { id: 'ua-2', userId: 'user-1', addressId: 'addr-2', isPrimary: false, label: 'Trabalho' },
];

const mockUserRepository = { findById: jest.fn() };
const mockUserAddressRepository = { findByUserId: jest.fn() };

describe('ListUserAddressesUseCase', () => {
  let useCase: ListUserAddressesUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ListUserAddressesUseCase,
        { provide: USER_REPOSITORY_PROVIDE, useValue: mockUserRepository },
        { provide: USER_ADDRESS_REPOSITORY_PROVIDE, useValue: mockUserAddressRepository },
      ],
    }).compile();
    useCase = module.get(ListUserAddressesUseCase);
    jest.clearAllMocks();
  });

  it('returns list of user addresses', async () => {
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockUserAddressRepository.findByUserId.mockResolvedValue(mockUserAddresses);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(mockUserRepository.findById).toHaveBeenCalledWith('user-1');
    expect(mockUserAddressRepository.findByUserId).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(mockUserAddresses);
  });

  it('returns empty array when user has no addresses', async () => {
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockUserAddressRepository.findByUserId.mockResolvedValue([]);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result).toEqual([]);
  });

  it('throws notFound when user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ userId: 'unknown' })).rejects.toThrow();
    expect(mockUserAddressRepository.findByUserId).not.toHaveBeenCalled();
  });
});
