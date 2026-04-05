import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserResponseDto {
  @ApiProperty({
    description: 'The ID of the user',
    example: faker.string.uuid(),
  })
  id: string;

  @ApiProperty({
    description: 'The Keycloak ID linked to this user',
    example: faker.string.uuid(),
    nullable: true,
  })
  keycloakId: string | null;

  @ApiProperty({
    description: 'The full name of the user',
    example: faker.person.fullName(),
  })
  fullName: string;

  @ApiProperty({
    description: 'The status of the user account',
    example: 'PENDING',
  })
  status: string;

  @ApiProperty({
    description: 'The creation date of the user',
    example: faker.date.past().toISOString(),
  })
  createdAt: Date;
}
