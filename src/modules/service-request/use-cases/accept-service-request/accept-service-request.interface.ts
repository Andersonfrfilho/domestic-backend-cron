import { ServiceRequest } from '@modules/shared/providers/database/entities/service-request.entity';

export interface AcceptServiceRequestUseCaseParams {
  id: string;
  providerId: string;
}

export type AcceptServiceRequestUseCaseResponse = ServiceRequest;

export interface AcceptServiceRequestUseCaseInterface {
  execute(params: AcceptServiceRequestUseCaseParams): Promise<AcceptServiceRequestUseCaseResponse>;
}
