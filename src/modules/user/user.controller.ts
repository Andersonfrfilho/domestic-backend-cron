import type { CacheProviderInterface } from '@adatechnology/cache';
import { CACHE_PROVIDER } from '@adatechnology/cache';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Injectable,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { UserAddress } from '@app/modules/shared/providers/database/entities/user-address.entity';

import { AddUserAddressRequestDto } from './use-cases/add-user-address/dtos/add-user-address-request.dto';
import { type UserServiceInterface } from './use-cases/create-users/create-user.interface';
import { CreateUserRequestDto } from './use-cases/create-users/dtos/create-user-request.dto';
import { CreateUserResponseDto } from './use-cases/create-users/dtos/create-user-response.dto';
import { UpdateUserRequestDto } from './use-cases/update-user/dtos/update-user-request.dto';
import { UserStats } from './user.repository.interface';
import { USER_SERVICE_PROVIDE } from './user.token';

@ApiTags('Users')
@Injectable()
@Controller('/users')
export class UserController {
  constructor(
    @Inject(USER_SERVICE_PROVIDE)
    private readonly userService: UserServiceInterface,
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: CacheProviderInterface,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar usuário', description: 'Cria usuário após registro no Keycloak. Público — não requer autenticação.' })
  @ApiCreatedResponse({ type: CreateUserResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiInternalServerErrorResponse()
  async create(@Body() params: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    const user = await this.userService.createUser(params);
    await this.cacheProvider.del('users:list').catch(() => null);
    return user;
  }

  @Get('me')
  @ApiOperation({ summary: 'Perfil do usuário autenticado', description: 'Retorna o usuário com base no X-User-Id injetado pelo Kong.' })
  @ApiHeader({ name: 'X-User-Id', description: 'keycloak_id injetado pelo Kong', required: true })
  @ApiOkResponse({ type: CreateUserResponseDto })
  @ApiNotFoundResponse()
  async getMe(@Headers('x-user-id') keycloakId: string): Promise<CreateUserResponseDto> {
    return this.userService.getUserByKeycloakId(keycloakId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID interno' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: CreateUserResponseDto })
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  async findById(@Param('id') id: string): Promise<CreateUserResponseDto> {
    return this.userService.getUserById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: CreateUserResponseDto })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    return this.userService.updateUser(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar usuário (soft delete — status = DELETED)' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  async delete(@Param('id') id: string): Promise<void> {
    await this.userService.deleteUser(id);
  }

  @Get('admin/stats')
  @ApiOperation({ summary: 'Contagem de usuários por tipo (Admin apenas)' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        totalUsers: { type: 'number' },
        customers: { type: 'number' },
        providers: { type: 'number' },
      },
    },
  })
  async getStats(): Promise<UserStats> {
    return this.userService.getUserStats();
  }

  @Get('me/addresses')
  @ApiOperation({ summary: 'Listar endereços do usuário autenticado' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiOkResponse({ type: [UserAddress] })
  async listAddresses(@Headers('x-user-id') keycloakId: string): Promise<UserAddress[]> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    return this.userService.listUserAddresses(user.id);
  }

  @Post('me/addresses')
  @ApiOperation({ summary: 'Adicionar endereço ao usuário autenticado' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiOkResponse({ type: UserAddress })
  async addAddress(
    @Headers('x-user-id') keycloakId: string,
    @Body() body: AddUserAddressRequestDto,
  ): Promise<UserAddress> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    return this.userService.addUserAddress({ ...body, userId: user.id });
  }

  @Delete('me/addresses/:addressId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover endereço do usuário autenticado' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiParam({ name: 'addressId', type: String })
  @ApiNoContentResponse()
  async removeAddress(
    @Headers('x-user-id') keycloakId: string,
    @Param('addressId') addressId: string,
  ): Promise<void> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    await this.userService.removeUserAddress(user.id, addressId);
  }
}
