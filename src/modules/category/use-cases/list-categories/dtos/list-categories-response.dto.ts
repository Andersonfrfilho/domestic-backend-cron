import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CategoryResponseDto {
  @ApiProperty({ example: faker.string.uuid() })
  id: string;

  @ApiProperty({ example: 'Limpeza' })
  name: string;

  @ApiProperty({ example: 'limpeza' })
  slug: string;

  @ApiProperty({ example: 'https://cdn.example.com/icons/limpeza.png', nullable: true })
  iconUrl: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;
}
