import { ServiceRequest } from '@modules/shared/providers/database/entities/service-request.entity';

export interface ListServiceRequestsByUserUseCaseParams {
  contractorId: string;
}

export type ListServiceRequestsByUserUseCaseResponse = ServiceRequest[];

export interface ListServiceRequestsByUserUseCaseInterface {
  execute(params: ListServiceRequestsByUserUseCaseParams): Promise<ListServiceRequestsByUserUseCaseResponse>;
}
