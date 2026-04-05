import { Service } from '@app/modules/shared/providers/database/entities/service.entity';

export interface GetServiceByIdUseCaseParams {
  id: string;
}

export interface GetServiceByIdUseCaseResponse extends Service {}

export interface GetServiceByIdUseCaseInterface {
  execute(params: GetServiceByIdUseCaseParams): Promise<GetServiceByIdUseCaseResponse>;
}
