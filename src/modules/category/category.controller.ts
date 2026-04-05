import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CategoryResponseDto } from './use-cases/list-categories/dtos/list-categories-response.dto';
import { CreateCategoryRequestDto } from './use-cases/create-category/dtos/create-category-request.dto';
import { UpdateCategoryRequestDto } from './use-cases/update-category/dtos/update-category-request.dto';
import { type CategoryServiceInterface } from './category.service';
import { CATEGORY_SERVICE_PROVIDE } from './category.token';

@ApiTags('Categories')
@Controller('/categories')
export class CategoryController {
  constructor(
    @Inject(CATEGORY_SERVICE_PROVIDE)
    private readonly categoryService: CategoryServiceInterface,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorias ativas (cacheado)' })
  @ApiOkResponse({ type: [CategoryResponseDto] })
  async list(): Promise<CategoryResponseDto[]> {
    return this.categoryService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar categoria por ID' })
  @ApiOkResponse({ type: CategoryResponseDto })
  @ApiNotFoundResponse({ description: 'Categoria não encontrada' })
  async findById(@Param('id') id: string): Promise<CategoryResponseDto> {
    return this.categoryService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova categoria (Admin)' })
  @ApiOkResponse({ type: CategoryResponseDto })
  @ApiBadRequestResponse({ description: 'Slug duplicado ou dados inválidos' })
  async create(@Body() body: CreateCategoryRequestDto): Promise<CategoryResponseDto> {
    return this.categoryService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar categoria (Admin)' })
  @ApiOkResponse({ type: CategoryResponseDto })
  @ApiNotFoundResponse({ description: 'Categoria não encontrada' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCategoryRequestDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.update({ id, ...body });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar categoria (Admin - Soft Delete)' })
  @ApiNoContentResponse({ description: 'Categoria desativada com sucesso' })
  @ApiNotFoundResponse({ description: 'Categoria não encontrada' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.categoryService.delete(id);
  }
}
