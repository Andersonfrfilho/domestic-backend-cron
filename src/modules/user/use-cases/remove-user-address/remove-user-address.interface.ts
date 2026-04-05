export interface RemoveUserAddressUseCaseParams {
  userId: string;
  userAddressId: string;
}

export interface RemoveUserAddressUseCaseInterface {
  execute(params: RemoveUserAddressUseCaseParams): Promise<void>;
}
