import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserRequestDto {
  @ApiProperty({ description: 'Nome completo do usuário', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;
}
