import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProviderRequestDto {
  @ApiProperty({ description: 'ID interno do usuário' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ description: 'Nome comercial do prestador' })
  @IsString()
  @IsOptional()
  businessName?: string;

  @ApiPropertyOptional({ description: 'Descrição do prestador' })
  @IsString()
  @IsOptional()
  description?: string;
}
