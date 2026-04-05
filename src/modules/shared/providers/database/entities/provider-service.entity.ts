import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ProviderProfile } from './provider-profile.entity';
import { Service } from './service.entity';

@Entity('provider_services')
export class ProviderService {
  @ApiProperty({ example: 'uuid-do-vinculo' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'uuid-do-prestador' })
  @Column({ name: 'provider_id' })
  providerId: string;

  @ApiProperty({ example: 'uuid-do-servico' })
  @Column({ name: 'service_id' })
  serviceId: string;

  @ApiPropertyOptional({ example: 150.00, description: 'Preço base cobrado pelo prestador' })
  @Column({ name: 'price_base', type: 'decimal', nullable: true })
  priceBase: number;

  @ApiPropertyOptional({ example: 'FIXED', description: 'Tipo de cobrança (HOUR, FIXED, etc.)' })
  @Column({ name: 'price_type', nullable: true })
  priceType: string;

  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @ManyToOne(() => Service, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
