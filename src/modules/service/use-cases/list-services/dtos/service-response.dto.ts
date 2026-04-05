import { ApiProperty } from '@nestjs/swagger';

export class ServiceResponseDto {
  @ApiProperty({ example: 'uuid-do-servico' })
  id: string;

  @ApiProperty({ example: 'uuid-da-categoria' })
  categoryId: string;

  @ApiProperty({ example: 'Faxina Geral' })
  name: string;

  @ApiProperty({ example: 'Descrição do serviço', nullable: true })
  description: string | null;

  @ApiProperty({
    example: { id: 'uuid-da-categoria', name: 'Limpeza', slug: 'limpeza' },
    required: false,
  })
  category?: any;
}
