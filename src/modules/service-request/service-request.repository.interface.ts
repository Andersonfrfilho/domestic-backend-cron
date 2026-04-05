import { ServiceRequest } from '@modules/shared/providers/database/entities/service-request.entity';

export interface CreateServiceRequestParams {
  contractorId: string;
  providerId: string;
  serviceId: string;
  addressId: string;
  description?: string;
  scheduledAt?: Date;
  priceFinal?: number;
}

export interface ServiceRequestRepositoryInterface {
  create(params: CreateServiceRequestParams): Promise<ServiceRequest>;
  findById(id: string): Promise<ServiceRequest | null>;
  listByContractor(contractorId: string): Promise<ServiceRequest[]>;
  listByProvider(providerId: string): Promise<ServiceRequest[]>;
  updateStatus(id: string, status: string): Promise<ServiceRequest>;
}
