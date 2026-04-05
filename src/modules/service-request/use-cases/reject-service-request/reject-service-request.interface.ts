import { ServiceRequest } from '@modules/shared/providers/database/entities/service-request.entity';

export interface RejectServiceRequestUseCaseParams {
  id: string;
  providerId: string;
}

export type RejectServiceRequestUseCaseResponse = ServiceRequest;

export interface RejectServiceRequestUseCaseInterface {
  execute(params: RejectServiceRequestUseCaseParams): Promise<RejectServiceRequestUseCaseResponse>;
}
