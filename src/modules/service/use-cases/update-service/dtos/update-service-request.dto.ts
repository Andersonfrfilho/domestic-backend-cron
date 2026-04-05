import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateServiceRequestDto {
  @ApiProperty({ example: ' limpeza-residencial-id-uuid', description: 'ID da categoria vinculada', required: false })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ example: 'Faxina Pesada', description: 'Nome do serviço', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'Serviço de limpeza profunda de residências',
    description: 'Descrição detalhada do serviço',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
