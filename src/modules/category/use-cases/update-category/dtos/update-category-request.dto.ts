import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryRequestDto {
  @ApiProperty({ example: 'Limpeza Residencial', description: 'Nome da categoria', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'limpeza-residencial', description: 'Slug único para URL', required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    example: 'https://cdn.example.com/icons/limpeza.png',
    description: 'URL do ícone',
    required: false,
  })
  @IsOptional()
  @IsString()
  iconUrl?: string;
}
