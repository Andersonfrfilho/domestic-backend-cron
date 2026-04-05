import { ServiceRequest } from '@modules/shared/providers/database/entities/service-request.entity';

export interface CompleteServiceRequestUseCaseParams {
  id: string;
  contractorId: string;
}

export type CompleteServiceRequestUseCaseResponse = ServiceRequest;

export interface CompleteServiceRequestUseCaseInterface {
  execute(params: CompleteServiceRequestUseCaseParams): Promise<CompleteServiceRequestUseCaseResponse>;
}
