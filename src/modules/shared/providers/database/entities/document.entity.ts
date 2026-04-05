import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user.entity';

@Entity('documents')
export class Document {
  @ApiProperty({ example: 'uuid-do-documento' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'uuid-do-usuario' })
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty({ example: 'CPF', description: 'Tipo do documento (ex: CPF, CNH, DIPLOMA)' })
  @Column({ name: 'document_type' })
  documentType: string;

  @ApiProperty({ example: 'documents/uuid/cpf.pdf', description: 'Caminho no bucket MinIO' })
  @Column({ name: 'document_url' })
  documentUrl: string;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  @Column()
  status: string;

  @ApiPropertyOptional({ example: '2026-04-05T14:00:00Z', nullable: true })
  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
