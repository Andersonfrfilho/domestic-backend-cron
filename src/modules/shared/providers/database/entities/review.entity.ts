import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ProviderProfile } from './provider-profile.entity';
import { ServiceRequest } from './service-request.entity';
import { User } from './user.entity';

@Entity('reviews')
export class Review {
  @ApiProperty({ example: 'uuid-da-review' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'uuid-da-solicitacao', description: 'Único por solicitação' })
  @Column({ name: 'service_request_id', unique: true })
  serviceRequestId: string;

  @ApiProperty({ example: 'uuid-do-contratante' })
  @Column({ name: 'contractor_id' })
  contractorId: string;

  @ApiProperty({ example: 'uuid-do-prestador' })
  @Column({ name: 'provider_id' })
  providerId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @Column({ type: 'int' })
  rating: number;

  @ApiPropertyOptional({ example: 'Serviço excelente, muito pontual!', nullable: true })
  @Column({ type: 'text', nullable: true })
  comment: string;

  @ApiProperty({ example: '2026-04-04T10:00:00Z' })
  @Column({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date;

  @OneToOne(() => ServiceRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_request_id' })
  serviceRequest: ServiceRequest;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contractor_id' })
  contractor: User;

  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;
}
