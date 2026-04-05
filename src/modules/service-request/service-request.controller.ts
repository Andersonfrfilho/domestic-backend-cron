import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { type UserServiceInterface } from '@modules/user/use-cases/create-users/create-user.interface';
import { USER_SERVICE_PROVIDE } from '@modules/user/user.token';
import { type ProviderRepositoryInterface } from '@modules/provider/provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '@modules/provider/provider.token';
import { ServiceRequest } from '@modules/shared/providers/database/entities/service-request.entity';

import { CreateServiceRequestRequestDto } from './use-cases/create-service-request/dtos/create-service-request-request.dto';
import { type ServiceRequestServiceInterface } from './service-request.service';
import { SERVICE_REQUEST_SERVICE_PROVIDE } from './service-request.token';

@ApiTags('Service Requests')
@Controller('/service-requests')
export class ServiceRequestController {
  constructor(
    @Inject(SERVICE_REQUEST_SERVICE_PROVIDE)
    private readonly serviceRequestService: ServiceRequestServiceInterface,
    @Inject(USER_SERVICE_PROVIDE)
    private readonly userService: UserServiceInterface,
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar solicitação de serviço (CUSTOMER)' })
  @ApiHeader({ name: 'X-User-Id', required: true, description: 'keycloak_id do contratante' })
  @ApiOkResponse({ type: ServiceRequest })
  @ApiBadRequestResponse({ description: 'Prestador não aprovado ou dados inválidos' })
  async create(
    @Headers('x-user-id') keycloakId: string,
    @Body() body: CreateServiceRequestRequestDto,
  ): Promise<ServiceRequest> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    return this.serviceRequestService.create({ ...body, contractorId: user.id });
  }

  @Get()
  @ApiOperation({ summary: 'Listar solicitações do usuário autenticado' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiHeader({ name: 'X-User-Type', required: false, description: 'CUSTOMER | PROVIDER' })
  @ApiOkResponse({ type: [ServiceRequest] })
  async list(
    @Headers('x-user-id') keycloakId: string,
    @Headers('x-user-type') userType: string,
  ): Promise<ServiceRequest[]> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);

    if (userType === 'PROVIDER') {
      const provider = await this.providerRepository.findByUserId(user.id);
      if (!provider) return [];
      return this.serviceRequestService.listByProvider(provider.id);
    }

    return this.serviceRequestService.listByContractor(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe da solicitação' })
  @ApiOkResponse({ type: ServiceRequest })
  @ApiNotFoundResponse()
  async findById(@Param('id') id: string): Promise<ServiceRequest> {
    return this.serviceRequestService.findById(id);
  }

  @Put(':id/accept')
  @ApiOperation({ summary: 'Prestador aceita solicitação (PENDING → ACCEPTED)' })
  @ApiHeader({ name: 'X-User-Id', required: true, description: 'keycloak_id do prestador' })
  @ApiOkResponse({ type: ServiceRequest })
  @ApiBadRequestResponse({ description: 'Status inválido ou não autorizado' })
  @ApiNotFoundResponse()
  async accept(
    @Param('id') id: string,
    @Headers('x-user-id') keycloakId: string,
  ): Promise<ServiceRequest> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    const provider = await this.providerRepository.findByUserId(user.id);
    return this.serviceRequestService.accept(id, provider?.id ?? '');
  }

  @Put(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Prestador rejeita solicitação (PENDING → REJECTED)' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiOkResponse({ type: ServiceRequest })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  async reject(
    @Param('id') id: string,
    @Headers('x-user-id') keycloakId: string,
  ): Promise<ServiceRequest> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    const provider = await this.providerRepository.findByUserId(user.id);
    return this.serviceRequestService.reject(id, provider?.id ?? '');
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Contratante confirma conclusão (ACCEPTED → COMPLETED)' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiOkResponse({ type: ServiceRequest })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  async complete(
    @Param('id') id: string,
    @Headers('x-user-id') keycloakId: string,
  ): Promise<ServiceRequest> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    return this.serviceRequestService.complete(id, user.id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Contratante cancela solicitação (PENDING|ACCEPTED → CANCELLED)' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiOkResponse({ type: ServiceRequest })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  async cancel(
    @Param('id') id: string,
    @Headers('x-user-id') keycloakId: string,
  ): Promise<ServiceRequest> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    return this.serviceRequestService.cancel(id, user.id);
  }
}
