import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class AddProviderServiceRequestDto {
  @ApiProperty({ description: 'ID do serviço do catálogo' })
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @ApiPropertyOptional({ description: 'Preço base cobrado pelo prestador' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceBase?: number;

  @ApiPropertyOptional({ description: 'Tipo de cobrança (ex: HOUR, FIXED)' })
  @IsString()
  @IsOptional()
  priceType?: string;
}
