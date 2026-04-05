import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryResponseDto {
  @ApiProperty({ example: faker.string.uuid() })
  id: string;

  @ApiProperty({ example: 'Limpeza Residencial' })
  name: string;

  @ApiProperty({ example: 'limpeza-residencial' })
  slug: string;

  @ApiProperty({ example: 'https://cdn.example.com/icons/limpeza.png', nullable: true })
  iconUrl: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;
}
