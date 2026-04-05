import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateReviewRequestDto {
  @ApiProperty({ description: 'ID da solicitação de serviço concluída' })
  @IsUUID()
  @IsNotEmpty()
  serviceRequestId: string;

  @ApiProperty({ description: 'Nota de 1 a 5', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Comentário sobre o serviço' })
  @IsString()
  @IsOptional()
  comment?: string;
}
