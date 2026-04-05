export interface RemoveProviderServiceUseCaseParams {
  providerId: string;
  serviceId: string;
}

export interface RemoveProviderServiceUseCaseInterface {
  execute(params: RemoveProviderServiceUseCaseParams): Promise<void>;
}
