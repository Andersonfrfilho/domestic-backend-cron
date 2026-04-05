import {
  Body,
  Controller,
  Delete,
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
  ApiConflictResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';
import { ProviderService as ProviderServiceEntity } from '@modules/shared/providers/database/entities/provider-service.entity';
import { ProviderVerification } from '@modules/shared/providers/database/entities/provider-verification.entity';
import { ProviderWorkLocation } from '@modules/shared/providers/database/entities/provider-work-location.entity';

import { CreateProviderRequestDto } from './use-cases/create-provider/dtos/create-provider-request.dto';
import { UpdateProviderRequestDto } from './use-cases/update-provider/dtos/update-provider-request.dto';
import { AddProviderServiceRequestDto } from './use-cases/add-provider-service/dtos/add-provider-service-request.dto';
import { AddWorkLocationRequestDto } from './use-cases/add-work-location/dtos/add-work-location-request.dto';
import { RejectProviderRequestDto } from './use-cases/reject-provider/dtos/reject-provider-request.dto';
import { type ProviderServiceInterface } from './provider.service';
import { PROVIDER_SERVICE_PROVIDE } from './provider.token';

@ApiTags('Providers')
@Controller('/providers')
export class ProviderController {
  constructor(
    @Inject(PROVIDER_SERVICE_PROVIDE)
    private readonly providerService: ProviderServiceInterface,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar perfil de prestador' })
  @ApiHeader({ name: 'X-User-Id', required: false })
  @ApiOkResponse({ type: ProviderProfile })
  @ApiConflictResponse({ description: 'Perfil já existe para este usuário' })
  async create(@Body() body: CreateProviderRequestDto): Promise<ProviderProfile> {
    return this.providerService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar prestadores aprovados' })
  @ApiOkResponse({ type: [ProviderProfile] })
  async list(): Promise<ProviderProfile[]> {
    return this.providerService.list();
  }

  @Get('admin/pending')
  @ApiOperation({ summary: 'Listar prestadores aguardando aprovação (Admin)' })
  @ApiOkResponse({ type: [ProviderProfile] })
  async listPending(): Promise<ProviderProfile[]> {
    return this.providerService.listPending();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar prestador por ID' })
  @ApiOkResponse({ type: ProviderProfile })
  @ApiNotFoundResponse({ description: 'Prestador não encontrado' })
  async findById(@Param('id') id: string): Promise<ProviderProfile> {
    return this.providerService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar perfil do prestador' })
  @ApiOkResponse({ type: ProviderProfile })
  @ApiNotFoundResponse()
  async update(
    @Param('id') id: string,
    @Body() body: UpdateProviderRequestDto,
  ): Promise<ProviderProfile> {
    return this.providerService.update({ id, ...body });
  }

  @Get(':id/services')
  @ApiOperation({ summary: 'Listar serviços do prestador' })
  @ApiOkResponse({ type: [ProviderServiceEntity] })
  async listServices(@Param('id') id: string): Promise<ProviderServiceEntity[]> {
    return this.providerService.listServices(id);
  }

  @Get(':id/work-locations')
  @ApiOperation({ summary: 'Listar locais de atendimento do prestador' })
  @ApiOkResponse({ type: [ProviderWorkLocation] })
  async listWorkLocations(@Param('id') id: string): Promise<ProviderWorkLocation[]> {
    return this.providerService.listWorkLocations(id);
  }

  @Post(':id/services')
  @ApiOperation({ summary: 'Adicionar serviço ao prestador' })
  @ApiOkResponse({ type: ProviderServiceEntity })
  @ApiConflictResponse({ description: 'Serviço já vinculado' })
  @ApiNotFoundResponse()
  async addService(
    @Param('id') id: string,
    @Body() body: AddProviderServiceRequestDto,
  ): Promise<ProviderServiceEntity> {
    return this.providerService.addService({ providerId: id, ...body });
  }

  @Delete(':id/services/:serviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover serviço do prestador' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  async removeService(
    @Param('id') id: string,
    @Param('serviceId') serviceId: string,
  ): Promise<void> {
    await this.providerService.removeService(id, serviceId);
  }

  @Post(':id/work-locations')
  @ApiOperation({ summary: 'Adicionar local de atendimento' })
  @ApiOkResponse({ type: ProviderWorkLocation })
  @ApiNotFoundResponse()
  async addWorkLocation(
    @Param('id') id: string,
    @Body() body: AddWorkLocationRequestDto,
  ): Promise<ProviderWorkLocation> {
    return this.providerService.addWorkLocation({ providerId: id, ...body });
  }

  @Delete(':id/work-locations/:locationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover local de atendimento' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  async removeWorkLocation(
    @Param('id') id: string,
    @Param('locationId') locationId: string,
  ): Promise<void> {
    await this.providerService.removeWorkLocation(id, locationId);
  }

  @Post(':id/verification')
  @ApiOperation({ summary: 'Submeter perfil para verificação (PENDING → UNDER_REVIEW)' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiOkResponse({ type: ProviderVerification })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse({ description: 'Status de verificação inválido' })
  async submitVerification(@Param('id') id: string): Promise<ProviderVerification> {
    return this.providerService.submitVerification(id);
  }

  @Get(':id/verification')
  @ApiOperation({ summary: 'Status da verificação do prestador' })
  @ApiOkResponse({ type: ProviderVerification })
  @ApiNotFoundResponse()
  async getVerification(@Param('id') id: string): Promise<ProviderVerification> {
    return this.providerService.getVerification(id);
  }

  @Put(':id/verification/approve')
  @ApiOperation({ summary: 'Aprovar prestador (Admin)' })
  @ApiHeader({ name: 'X-User-Id', required: true, description: 'ID do admin revisor' })
  @ApiOkResponse({ type: ProviderVerification })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse({ description: 'Status de verificação inválido' })
  async approve(
    @Param('id') id: string,
    @Headers('x-user-id') reviewedBy: string,
  ): Promise<ProviderVerification> {
    return this.providerService.approve({ providerId: id, reviewedBy });
  }

  @Put(':id/verification/reject')
  @ApiOperation({ summary: 'Rejeitar prestador (Admin)' })
  @ApiHeader({ name: 'X-User-Id', required: true, description: 'ID do admin revisor' })
  @ApiOkResponse({ type: ProviderVerification })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  async reject(
    @Param('id') id: string,
    @Headers('x-user-id') reviewedBy: string,
    @Body() body: RejectProviderRequestDto,
  ): Promise<ProviderVerification> {
    return this.providerService.reject({ providerId: id, reviewedBy, reason: body.reason });
  }
}
