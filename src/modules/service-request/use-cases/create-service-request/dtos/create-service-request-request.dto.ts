import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateServiceRequestRequestDto {
  @ApiProperty({ description: 'ID do prestador' })
  @IsUUID()
  @IsNotEmpty()
  providerId: string;

  @ApiProperty({ description: 'ID do serviço do catálogo' })
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ description: 'ID do endereço onde o serviço será realizado' })
  @IsUUID()
  @IsNotEmpty()
  addressId: string;

  @ApiPropertyOptional({ description: 'Descrição adicional da solicitação' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Data/hora agendada para o serviço' })
  @IsDateString()
  @IsOptional()
  scheduledAt?: Date;

  @ApiPropertyOptional({ description: 'Preço combinado' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceFinal?: number;
}
