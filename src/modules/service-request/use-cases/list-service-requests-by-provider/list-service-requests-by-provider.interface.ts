import { ServiceRequest } from '@modules/shared/providers/database/entities/service-request.entity';

export interface ListServiceRequestsByProviderUseCaseParams {
  providerId: string;
}

export type ListServiceRequestsByProviderUseCaseResponse = ServiceRequest[];

export interface ListServiceRequestsByProviderUseCaseInterface {
  execute(params: ListServiceRequestsByProviderUseCaseParams): Promise<ListServiceRequestsByProviderUseCaseResponse>;
}
