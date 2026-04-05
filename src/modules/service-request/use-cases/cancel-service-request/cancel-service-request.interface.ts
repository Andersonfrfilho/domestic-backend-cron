import { ServiceRequest } from '@modules/shared/providers/database/entities/service-request.entity';

export interface CancelServiceRequestUseCaseParams {
  id: string;
  contractorId: string;
}

export type CancelServiceRequestUseCaseResponse = ServiceRequest;

export interface CancelServiceRequestUseCaseInterface {
  execute(params: CancelServiceRequestUseCaseParams): Promise<CancelServiceRequestUseCaseResponse>;
}
