import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class AddUserAddressRequestDto {
  @ApiProperty({ example: 'Rua das Flores' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: '123' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({ example: 'Apto 45', required: false })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiProperty({ example: 'Centro' })
  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @ApiProperty({ example: 'Fortaleza' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'CE' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '60010-000' })
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty({ example: -3.7319, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: -38.5267, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ example: 'Casa', required: false })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ example: false, required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
