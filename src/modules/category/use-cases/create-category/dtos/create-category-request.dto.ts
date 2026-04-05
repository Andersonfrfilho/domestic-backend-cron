import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryRequestDto {
  @ApiProperty({ example: 'Limpeza', description: 'Nome da categoria' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'limpeza', description: 'Slug único para URL' })
  @IsString()
  slug: string;

  @ApiProperty({
    example: 'https://cdn.example.com/icons/limpeza.png',
    description: 'URL do ícone (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  iconUrl?: string;
}
