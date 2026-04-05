import { UserAddress } from '@modules/shared/providers/database/entities/user-address.entity';

export interface ListUserAddressesUseCaseParams {
  userId: string;
}

export type ListUserAddressesUseCaseResponse = UserAddress[];

export interface ListUserAddressesUseCaseInterface {
  execute(params: ListUserAddressesUseCaseParams): Promise<ListUserAddressesUseCaseResponse>;
}
