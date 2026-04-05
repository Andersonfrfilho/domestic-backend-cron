import { UserAddress } from '@modules/shared/providers/database/entities/user-address.entity';

export interface CreateUserAddressParams {
  userId: string;
  addressId: string;
  label?: string;
  isPrimary?: boolean;
}

export interface UpdateUserAddressParams {
  label?: string;
  isPrimary?: boolean;
}

export interface UserAddressRepositoryInterface {
  create(userAddress: CreateUserAddressParams): Promise<UserAddress>;
  findById(id: string): Promise<UserAddress | null>;
  findByUserId(userId: string): Promise<UserAddress[]>;
  findByAddressId(addressId: string): Promise<UserAddress[]>;
  findPrimaryByUserId(userId: string): Promise<UserAddress | null>;
  update(id: string, userAddress: UpdateUserAddressParams): Promise<UserAddress>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  linkUserToAddress(
    userId: string,
    addressId: string,
    label?: string,
    isPrimary?: boolean,
  ): Promise<UserAddress>;
  unlinkUserFromAddress(userId: string, addressId: string): Promise<void>;
}
