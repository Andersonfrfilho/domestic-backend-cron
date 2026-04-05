import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddWorkLocationRequestDto {
  @ApiProperty({ description: 'ID do endereço existente' })
  @IsUUID()
  @IsNotEmpty()
  addressId: string;

  @ApiPropertyOptional({ description: 'Nome/rótulo do local de atendimento' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Define como local principal' })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
