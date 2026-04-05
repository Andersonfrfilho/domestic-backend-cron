import { UserAddress } from '@modules/shared/providers/database/entities/user-address.entity';

export interface AddUserAddressUseCaseParams {
  userId: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  label?: string;
  isPrimary?: boolean;
}

export interface AddUserAddressUseCaseResponse extends UserAddress {}

export interface AddUserAddressUseCaseInterface {
  execute(params: AddUserAddressUseCaseParams): Promise<AddUserAddressUseCaseResponse>;
}
