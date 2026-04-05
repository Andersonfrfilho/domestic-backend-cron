import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Address } from './address.entity';
import { ProviderProfile } from './provider-profile.entity';

@Entity('provider_work_locations')
export class ProviderWorkLocation {
  @ApiProperty({ example: 'uuid-do-local' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'uuid-do-prestador' })
  @Column({ name: 'provider_id' })
  providerId: string;

  @ApiProperty({ example: 'uuid-do-endereco' })
  @Column({ name: 'address_id' })
  addressId: string;

  @ApiPropertyOptional({ example: 'Escritório Centro', nullable: true })
  @Column({ nullable: true })
  name: string;

  @ApiProperty({ example: false })
  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @ApiProperty({ example: true })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-04-04T10:00:00Z' })
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @ManyToOne(() => Address, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'address_id' })
  address: Address;
}
