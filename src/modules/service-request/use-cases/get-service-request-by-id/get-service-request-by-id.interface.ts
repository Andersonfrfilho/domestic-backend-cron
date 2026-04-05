import { ServiceRequest } from '@modules/shared/providers/database/entities/service-request.entity';

export interface GetServiceRequestByIdUseCaseParams {
  id: string;
}

export type GetServiceRequestByIdUseCaseResponse = ServiceRequest;

export interface GetServiceRequestByIdUseCaseInterface {
  execute(params: GetServiceRequestByIdUseCaseParams): Promise<GetServiceRequestByIdUseCaseResponse>;
}
