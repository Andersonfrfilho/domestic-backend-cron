import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Address } from './address.entity';
import { ProviderProfile } from './provider-profile.entity';
import { Service } from './service.entity';
import { User } from './user.entity';

@Entity('service_requests')
export class ServiceRequest {
  @ApiProperty({ example: 'uuid-da-solicitacao' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'uuid-do-contratante' })
  @Column({ name: 'contractor_id' })
  contractorId: string;

  @ApiProperty({ example: 'uuid-do-prestador' })
  @Column({ name: 'provider_id' })
  providerId: string;

  @ApiProperty({ example: 'uuid-do-servico' })
  @Column({ name: 'service_id' })
  serviceId: string;

  @ApiProperty({ example: 'uuid-do-endereco' })
  @Column({ name: 'address_id' })
  addressId: string;

  @ApiProperty({
    example: 'PENDING',
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
  })
  @Column()
  status: string;

  @ApiProperty({ example: false })
  @Column({ name: 'contractor_confirmed', default: false })
  contractorConfirmed: boolean;

  @ApiProperty({ example: false })
  @Column({ name: 'provider_confirmed', default: false })
  providerConfirmed: boolean;

  @ApiPropertyOptional({ example: 'Preciso de faxina completa, incluindo banheiros', nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiPropertyOptional({ example: '2026-04-10T09:00:00Z', nullable: true })
  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @ApiPropertyOptional({ example: 200.00, nullable: true })
  @Column({ name: 'price_final', type: 'decimal', nullable: true })
  priceFinal: number;

  @ApiProperty({ example: '2026-04-04T10:00:00Z' })
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contractor_id' })
  contractor: User;

  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @ManyToOne(() => Service, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => Address, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'address_id' })
  address: Address;
}
