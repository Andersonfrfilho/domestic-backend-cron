import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { ServiceResponseDto } from './use-cases/list-services/dtos/service-response.dto';
import { CreateServiceRequestDto } from './use-cases/create-service/dtos/create-service-request.dto';
import { UpdateServiceRequestDto } from './use-cases/update-service/dtos/update-service-request.dto';
import { type ServiceServiceInterface } from './service.service';
import { SERVICE_SERVICE_PROVIDE } from './service.token';

@ApiTags('Services')
@Controller('/services')
export class ServiceController {
  constructor(
    @Inject(SERVICE_SERVICE_PROVIDE)
    private readonly serviceService: ServiceServiceInterface,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar catálogo de serviços' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filtrar por categoria' })
  @ApiOkResponse({ type: [ServiceResponseDto] })
  async list(@Query('categoryId') categoryId?: string): Promise<ServiceResponseDto[]> {
    return this.serviceService.list({ categoryId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar serviço por ID' })
  @ApiOkResponse({ type: ServiceResponseDto })
  @ApiNotFoundResponse({ description: 'Serviço não encontrado' })
  async findById(@Param('id') id: string): Promise<ServiceResponseDto> {
    return this.serviceService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo serviço no catálogo (Admin)' })
  @ApiOkResponse({ type: ServiceResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiNotFoundResponse({ description: 'Categoria não encontrada' })
  async create(@Body() body: CreateServiceRequestDto): Promise<ServiceResponseDto> {
    return this.serviceService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar serviço no catálogo (Admin)' })
  @ApiOkResponse({ type: ServiceResponseDto })
  @ApiNotFoundResponse({ description: 'Serviço ou Categoria não encontrados' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateServiceRequestDto,
  ): Promise<ServiceResponseDto> {
    return this.serviceService.update({ id, ...body });
  }
}
