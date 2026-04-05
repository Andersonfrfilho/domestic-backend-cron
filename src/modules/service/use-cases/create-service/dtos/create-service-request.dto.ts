import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateServiceRequestDto {
  @ApiProperty({ example: ' limpeza-residencial-id-uuid', description: 'ID da categoria vinculada' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'Faxina Geral', description: 'Nome do serviço' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Serviço de limpeza completa de residências',
    description: 'Descrição detalhada do serviço',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
