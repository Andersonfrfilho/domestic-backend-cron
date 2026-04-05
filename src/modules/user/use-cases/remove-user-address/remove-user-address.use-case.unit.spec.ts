import { Test } from '@nestjs/testing';

import { USER_ADDRESS_REPOSITORY_PROVIDE } from '@modules/user/user.token';

import { RemoveUserAddressUseCase } from './remove-user-address.use-case';

const mockUserAddress = { id: 'ua-1', userId: 'user-1', addressId: 'addr-1', isPrimary: false };
const mockUserAddressRepository = { findById: jest.fn(), delete: jest.fn() };

describe('RemoveUserAddressUseCase', () => {
  let useCase: RemoveUserAddressUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RemoveUserAddressUseCase,
        { provide: USER_ADDRESS_REPOSITORY_PROVIDE, useValue: mockUserAddressRepository },
      ],
    }).compile();
    useCase = module.get(RemoveUserAddressUseCase);
    jest.clearAllMocks();
  });

  it('removes user address when found and owned by user', async () => {
    mockUserAddressRepository.findById.mockResolvedValue(mockUserAddress);
    mockUserAddressRepository.delete.mockResolvedValue(undefined);

    await useCase.execute({ userId: 'user-1', userAddressId: 'ua-1' });

    expect(mockUserAddressRepository.findById).toHaveBeenCalledWith('ua-1');
    expect(mockUserAddressRepository.delete).toHaveBeenCalledWith('ua-1');
  });

  it('throws notFound when userAddress does not exist', async () => {
    mockUserAddressRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ userId: 'user-1', userAddressId: 'unknown' })).rejects.toThrow();
    expect(mockUserAddressRepository.delete).not.toHaveBeenCalled();
  });

  it('throws notFound when address belongs to different user (security)', async () => {
    mockUserAddressRepository.findById.mockResolvedValue({ ...mockUserAddress, userId: 'other-user' });

    await expect(useCase.execute({ userId: 'user-1', userAddressId: 'ua-1' })).rejects.toThrow();
    expect(mockUserAddressRepository.delete).not.toHaveBeenCalled();
  });
});
