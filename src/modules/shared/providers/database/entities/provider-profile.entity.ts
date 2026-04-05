import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user.entity';

@Entity('provider_profiles')
export class ProviderProfile {
  @ApiProperty({ example: 'uuid-do-prestador' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'uuid-do-usuario' })
  @Column({ name: 'user_id', unique: true })
  userId: string;

  @ApiPropertyOptional({ example: 'Anderson Serviços' })
  @Column({ name: 'business_name', nullable: true })
  businessName: string;

  @ApiPropertyOptional({ example: 'Prestador de serviços residenciais com 10 anos de experiência' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ example: 4.8, description: 'Média de avaliações (recalculada diariamente)' })
  @Column({ name: 'average_rating', type: 'decimal', default: 0 })
  averageRating: number;

  @ApiProperty({ example: true })
  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
