import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateUserRequestDto {
  @ApiProperty({
    description: 'The full name of the user',
    example: faker.person.fullName(),
  })
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'The Keycloak ID linked to this user',
    example: faker.string.uuid(),
    required: false,
  })
  @IsOptional()
  @IsString()
  keycloakId?: string;

  @ApiProperty({
    description: 'The status of the user account',
    example: 'PENDING',
    required: false,
    default: 'PENDING',
    enum: ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED'],
  })
  @IsOptional()
  @IsString()
  status?: string;
}
