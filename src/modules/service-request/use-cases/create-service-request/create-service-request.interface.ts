import { ServiceRequest } from '@modules/shared/providers/database/entities/service-request.entity';

export interface CreateServiceRequestUseCaseParams {
  contractorId: string;
  providerId: string;
  serviceId: string;
  addressId: string;
  description?: string;
  scheduledAt?: Date;
  priceFinal?: number;
}

export type CreateServiceRequestUseCaseResponse = ServiceRequest;

export interface CreateServiceRequestUseCaseInterface {
  execute(params: CreateServiceRequestUseCaseParams): Promise<CreateServiceRequestUseCaseResponse>;
}
